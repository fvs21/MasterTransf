import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import useBLE from './hooks/useBLE';

export default function App() {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices
  } = useBLE();

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled)
      scanForPeripherals();
  }

  return (
    <View style={styles.container}>
      <Text>
        You're in bro
      </Text>
      <TouchableOpacity
        onPress={scanForDevices}
        style={{ marginTop: 40, backgroundColor: "red", padding: 20 }}
      >
        <Text>Click me</Text>
      </TouchableOpacity>
      {allDevices.length > 0 && (
        <FlatList
          data={allDevices}
          renderItem={({ item }) => (
            <View>
              <Text>{item.name}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      )}
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
