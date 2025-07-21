import { Bluetooth, BluetoothConnected, BluetoothSearching } from "lucide-react";

export type ConnectionState = 'disconnected' | 'connecting' | 'connected';

interface ConnectionStatusProps {
  state: ConnectionState;
  deviceName?: string;
}

export const ConnectionStatus = ({ state, deviceName = "ESP32_STT" }: ConnectionStatusProps) => {
  const getStatusConfig = () => {
    switch (state) {
      case 'connected':
        return {
          icon: BluetoothConnected,
          text: `Connected to ${deviceName}`,
          color: 'text-status-connected',
          bgColor: 'bg-status-connected/10',
          borderColor: 'border-status-connected/30'
        };
      case 'connecting':
        return {
          icon: BluetoothSearching,
          text: `Connecting to ${deviceName}...`,
          color: 'text-status-connecting',
          bgColor: 'bg-status-connecting/10',
          borderColor: 'border-status-connecting/30'
        };
      case 'disconnected':
      default:
        return {
          icon: Bluetooth,
          text: `Disconnected from ${deviceName}`,
          color: 'text-status-disconnected',
          bgColor: 'bg-status-disconnected/10',
          borderColor: 'border-status-disconnected/30'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border ${config.bgColor} ${config.borderColor} transition-all duration-300`}>
      <Icon className={`w-5 h-5 ${config.color} ${state === 'connecting' ? 'animate-spin' : ''}`} />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    </div>
  );
};