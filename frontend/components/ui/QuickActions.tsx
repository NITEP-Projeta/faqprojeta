// components/admin/QuickActions.tsx
'use client';

import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const NewUserModal = dynamic(() => import('./modals/NewUserModal'), { ssr:false });

export const QuickActions: FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex space-x-2">
        <Button onClick={() => setOpen(true)}>+ Novo Usuário</Button>
        {/* outros botões */}
      </div>
      <NewUserModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
};
