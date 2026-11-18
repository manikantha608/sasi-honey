import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshThunk, selectIsInitialized } from '../features/auth/authSlice.js';

const useAuthInit = () => {
  const dispatch     = useDispatch();
  const isInitialized= useSelector(selectIsInitialized);

  useEffect(() => {
    if (!isInitialized) dispatch(refreshThunk());
  }, [dispatch, isInitialized]);

  return isInitialized;
};

export default useAuthInit;
