// src/components/layout/SidebarToggle.tsx
'use client'; // This will be a client component for interactivity

import { useState } from 'react';

export default function SidebarToggle() {
  // This will be for the collapsible logic later
  return (
    <button className="p-2 rounded-md hover:bg-gray-700 text-white">
      {/* Icon will go here */}
      Toggle Sidebar
    </button>
  );
}