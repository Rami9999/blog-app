"use client"
import React from 'react'
import FacePile from "@convex-dev/presence/facepile";
import usePresence from "@convex-dev/presence/react";
import { Id } from '@/convex/_generated/dataModel';
import { api } from '@/convex/_generated/api';


interface iAppProps {
    roomId: Id<'posts'>;
    userId: string
}

function PostPresence({roomId,userId}:iAppProps) {
  const presenceState = usePresence(api.presence, roomId, userId);

  if(!presenceState || presenceState.length == 0)
  {
    return null
  }

  return (
    <div className='flex items-center gap-2'>
      <p className='text-xs uppercase tracking-wide text-muted-foreground'>Viewing now</p>
      <div className='text-black'>
        <FacePile presenceState={presenceState} />
      </div>
    </div>
  );

}

export default PostPresence