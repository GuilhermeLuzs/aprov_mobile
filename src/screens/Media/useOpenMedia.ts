import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReviewTab, RootStackParamList } from '../../navigation/types';

const TABS: ReviewTab[] = ['HomeTab', 'FeedTab', 'ProfileTab'];

function isTab(name: string | undefined): name is ReviewTab {
  return TABS.some((tab) => tab === name);
}

export function useOpenMedia(): (reviewIds: string[], reviewId: string, index?: number) => void {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (reviewIds, reviewId, index = 0) => {
    const tabs = navigation.getParent()?.getState();
    const current = tabs?.routes[tabs.index]?.name;
    navigation.navigate('MediaViewer', {
      reviewIds,
      reviewId,
      index,
      originTab: isTab(current) ? current : 'FeedTab',
    });
  };
}
