import { Provider } from 'react-redux';
import { store } from './contexts/store';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <Provider store={store}>
      <Toaster position="top-right" reverseOrder={false} />
      <AppRouter />
    </Provider>
  )
}

export default App
