import { useEffect, useState, useCallback } from "react";
import { ConnectionState } from "./ConnectionStatus";

interface BluetoothManagerProps {
  onConnectionStateChange: (state: ConnectionState) => void;
  onDataSend: (data: string) => void;
}

export const BluetoothManager = ({ 
  onConnectionStateChange, 
  onDataSend 
}: BluetoothManagerProps) => {
  const [bluetoothDevice, setBluetoothDevice] = useState<any>(null);
  const [bluetoothServer, setBluetoothServer] = useState<any>(null);
  const [characteristic, setCharacteristic] = useState<any>(null);

  // Bluetooth Serial Service UUID (standard SPP UUID)
  const BLUETOOTH_SERIAL_SERVICE_UUID = "00001101-0000-1000-8000-00805f9b34fb";
  const BLUETOOTH_SERIAL_CHARACTERISTIC_UUID = "00001101-0000-1000-8000-00805f9b34fb";

  const connectToDevice = useCallback(async () => {
    try {
      onConnectionStateChange('connecting');

      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: 'ESP32_STT' },
          { namePrefix: 'ESP32' }
        ],
        optionalServices: [BLUETOOTH_SERIAL_SERVICE_UUID]
      });

      setBluetoothDevice(device);

      // Connect to GATT server
      const server = await device.gatt?.connect();
      if (!server) throw new Error('Failed to connect to GATT server');
      
      setBluetoothServer(server);

      // Get the serial service
      const service = await server.getPrimaryService(BLUETOOTH_SERIAL_SERVICE_UUID);
      
      // Get the characteristic for writing data
      const char = await service.getCharacteristic(BLUETOOTH_SERIAL_CHARACTERISTIC_UUID);
      setCharacteristic(char);

      onConnectionStateChange('connected');
      console.log('Connected to ESP32_STT via Bluetooth');

    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      onConnectionStateChange('disconnected');
      
      // Auto-retry connection after 3 seconds
      setTimeout(() => {
        connectToDevice();
      }, 3000);
    }
  }, [onConnectionStateChange]);

  const sendData = useCallback(async (data: string) => {
    if (!characteristic) {
      console.warn('No Bluetooth characteristic available');
      return;
    }

    try {
      const encoder = new TextEncoder();
      const dataToSend = encoder.encode(data + '\n'); // Add newline for ESP32
      await characteristic.writeValue(dataToSend);
      onDataSend(data);
      console.log('Sent to ESP32:', data);
    } catch (error) {
      console.error('Failed to send data:', error);
      // Try to reconnect
      onConnectionStateChange('disconnected');
      setTimeout(() => {
        connectToDevice();
      }, 1000);
    }
  }, [characteristic, onDataSend, connectToDevice, onConnectionStateChange]);

  // Auto-connect on component mount
  useEffect(() => {
    // Check if Web Bluetooth is supported
    if (!navigator.bluetooth) {
      console.error('Web Bluetooth is not supported in this browser');
      return;
    }

    // Start connection attempt
    connectToDevice();

    // Cleanup on unmount
    return () => {
      if (bluetoothServer?.connected) {
        bluetoothServer.disconnect();
      }
    };
  }, [connectToDevice]);

  // Handle device disconnection
  useEffect(() => {
    if (bluetoothDevice) {
      const handleDisconnection = () => {
        console.log('Bluetooth device disconnected');
        onConnectionStateChange('disconnected');
        setBluetoothServer(null);
        setCharacteristic(null);
        
        // Auto-reconnect after 2 seconds
        setTimeout(() => {
          connectToDevice();
        }, 2000);
      };

      bluetoothDevice.addEventListener('gattserverdisconnected', handleDisconnection);

      return () => {
        bluetoothDevice.removeEventListener('gattserverdisconnected', handleDisconnection);
      };
    }
  }, [bluetoothDevice, onConnectionStateChange, connectToDevice]);

  // Expose sendData function to parent component
  useEffect(() => {
    // This will be used by the parent component to send transcription data
    (window as any).sendToESP32 = sendData;
    
    return () => {
      delete (window as any).sendToESP32;
    };
  }, [sendData]);

  return null; // This component doesn't render anything
};