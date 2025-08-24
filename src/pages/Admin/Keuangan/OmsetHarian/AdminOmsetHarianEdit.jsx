import React from 'react';
import { useParams } from 'react-router-dom';
import AdminOmsetHarianForm from './AdminOmsetHarianForm';

const AdminOmsetHarianEdit = () => {
  const { id } = useParams();
  
  return <AdminOmsetHarianForm id={id} />;
};

export default AdminOmsetHarianEdit;
