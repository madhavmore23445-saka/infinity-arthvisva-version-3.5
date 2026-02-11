import Toast, { BaseToast } from 'react-native-toast-message';

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#22c55e',
        backgroundColor: '#0f172a',
        borderRadius: 14,
        paddingVertical: 12,
      }}
      contentContainerStyle={{
        paddingHorizontal: 16,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: '#ffffff',
      }}
      text2Style={{
        fontSize: 13,
        color: '#cbd5e1',
        marginTop: 2,
      }}
    />
  ),
};


export default toastConfig;