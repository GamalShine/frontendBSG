import React from 'react';
import { useParams } from 'react-router-dom';
import OwnerOmsetHarianForm from './OwnerOmsetHarianForm';

const OwnerOmsetHarianEdit = () => {
  const { id } = useParams();
  
  return <OwnerOmsetHarianForm id={id} />;
};

export default OwnerOmsetHarianEdit;
