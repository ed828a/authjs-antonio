'use client'
import React from 'react'

import {FcGoogle} from 'react-icons/fc'
import {FaGithub} from 'react-icons/fa'
import { Button } from '../ui/button'

type Props = {}

const Social = (props: Props) => {
  return (
    <div className='flex items-center w-full gap-x-2'>
        <Button size={"lg"} className='w-full' variant={"outline"} onClick={() => {}} >
            <FcGoogle className='h-5 w-5' />
        </Button>
        <Button size={"lg"} className='w-full' variant={"outline"} onClick={() => {}} >
            <FaGithub className='h-5 w-5' />
        </Button>
    </div>
  )
}

export default Social