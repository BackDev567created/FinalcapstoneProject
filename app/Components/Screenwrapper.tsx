import { View, Text } from 'react-native'
import React, { ReactNode } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type ScreenWrapperProp = {
    children: ReactNode;
    bg?: string;
}

const Screenwrapper = ({children, bg}: ScreenWrapperProp) => {

    const {top} = useSafeAreaInsets();
    const paddingTop = top > 0 ? top+5: 30;
  return (
    <View style={{flex: 1, paddingTop, backgroundColor: bg}}>
      {
        children
      }
    </View>
  );
};

export default Screenwrapper