import { Award } from 'lucide-react-native';
import { useWallet } from '../store/wallet';
import { RewardAmount } from './RewardAmount';

export function PointsBalance() {
  const wallet = useWallet();
  return <RewardAmount amount={wallet.aprovPoints} label="pontos" icon={Award} />;
}
