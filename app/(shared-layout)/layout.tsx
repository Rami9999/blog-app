import Navbar from '@/components/web/navbar'
import React, { ReactNode } from 'react'

function SharedLayout({children} : {children : ReactNode}) {
  return (
    <>
        <Navbar />
        {children}
    </>
  )
}

export default SharedLayout