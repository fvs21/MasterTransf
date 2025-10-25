import { StyleSheet } from 'react-native';

export const formStyles = StyleSheet.create({
  fieldGroup: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  feedback: {
    fontSize: 13,
    marginTop: 4,
  },
  success: {
    color: '#16A34A',
  },
  error: {
    color: '#DC2626',
  },
  helperText: {
    fontSize: 12,
    opacity: 0.7,
  },
});
