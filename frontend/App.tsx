import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import usePeripheral from './hooks/usePeripheral';

export default function App() {
  const { startAdvertising, stopAdverstising } = usePeripheral();

  /**
   *  const scanForDevices = async () => {
      const isPermissionsEnabled = await requestPermissions();
        if (isPermissionsEnabled)
          scanForPeripherals();
      }
   */

  return (
    <View style={styles.container}>
      <Text>
        You're in bro
      </Text>
      <TouchableOpacity
        onPress={startAdvertising}
        style={{ marginTop: 40, backgroundColor: "red", padding: 20 }}
      >
        <Text>Start</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={stopAdverstising}
        style={{ marginTop: 40, backgroundColor: "red", padding: 20 }}
      >
        <Text>Stop</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
