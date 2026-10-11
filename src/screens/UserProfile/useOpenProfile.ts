import { useNavigation } from '@react-navigation/native';
import { useCurrentUser } from '../../store/session';
import type { PeopleNavigation } from '../../navigation/types';

export function useOpenProfile(): (userId: string) => void {
  const navigation = useNavigation<PeopleNavigation<'UserProfile'>>();
  const me = useCurrentUser();

  return (userId: string) => {
    if (userId === me.id) {
      navigation.navigate('MainTabs', {
        screen: 'ProfileTab',
        params: { screen: 'Profile', pop: true },
      });
    } else {
      navigation.push('UserProfile', { userId });
    }
  };
}
