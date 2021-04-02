import React, { useState } from 'react';
import { useRouter } from 'next/router';
import addNote from 'lib/api/addNote';
import { useAuth } from 'utils/useAuth';

export default function SidebarInput() {
  const { user } = useAuth();
  const router = useRouter();
  const [inputText, setInputText] = useState('');

  const onInputSubmit = async () => {
    if (!user) {
      return;
    }
    const note = await addNote(user.id, inputText);
    if (!note) {
      return;
    }
    setInputText('');
    router.push(`/app/note/${note.id}`);
  };

  return (
    <input
      type="text"
      className="mx-6 my-2 input"
      placeholder="Create note"
      value={inputText}
      onChange={(e) => setInputText(e.target.value)}
      onKeyPress={(event) => {
        if (event.key === 'Enter') {
          onInputSubmit();
        }
      }}
    />
  );
}
