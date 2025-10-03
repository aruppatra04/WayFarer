"use client"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { Loader, Send } from 'lucide-react'
import React, { useState } from 'react'
import EmptyBoxState from './EmptyBoxState'
import GroupSizeUi from './GroupSizeUi'
import BudgetUi from './BudgetUi'
import FinalUi from './FinalUi'
import SelectDays from './SelectDays'
import TripTypeUi from './TripTypeUi'

type Message = {
    role: string,
    content: string,
    ui?: string,
}

function ChatBox() {

  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const onSend = async () => {
    if(!userInput?.trim()) {
        return;
    }

    setLoading(true);
    setUserInput('');
    const newMessage: Message = {
        role: 'user',
        content: userInput.trim(),
    }
    setMessages((prev:Message[]) => [...prev, newMessage]);
    const result = await axios.post('api/aimodel', {
        messages: [...messages, newMessage]
    })
    
    setMessages((prev:Message[]) => [...prev, {
        role: 'assistant',
        content: result.data.resp,
        ui: result?.data?.ui,
    }]);

    console.log(result.data);
    setLoading(false);
  }

  const RenderGenerativeUi = (ui: string) => {
    if(ui === 'budget') {
        // Budget ui component
        return <BudgetUi onSelectedOption = {(v: string) => {setUserInput(v); onSend()}} />
    }
    // } else if(ui === 'groupSize') {
    //     // Group size ui component
    //     return <GroupSizeUi onSelectedOption = {(v: string) => {setUserInput(v); onSend()}} />
    // }
    else if (ui === 'groupSize') {
        return (
            <GroupSizeUi
                onSelectedOption={(v: string) => { 
                    if (v.startsWith('Just Me')) {
                        // setUserInput(v); 
                        // onSend();

                        setMessages((prev) => [
                            ...prev,
                            {
                                role: 'user',
                                content: v,
                            },
                            {   
                                role: 'assistant',
                                content: 'Great! What type of trip are you planning?',
                                ui: 'tripType',
                            },
                        ]);
                    } else {
                        setUserInput(v); 
                        onSend();
                    }
                }}
            />
        );
    } else if(ui === 'tripDuration') {
        // Group size ui component
        return <SelectDays onSelectedOption = {(v: string) => {setUserInput(v); onSend()}} />
    } else if(ui === 'tripType') {
        // Group size ui component
        return <TripTypeUi onSelectedOption = {(v: string) => {setUserInput(v); onSend()}} />
    } else if(ui === 'final') {
        // Group size ui component
        return <FinalUi viewTrip = {() => console.log()} />
    }
    return null;
  }

  return (
    <div className='h-[85vh] flex flex-col'> 
        {messages.length === 0 && 
            <EmptyBoxState 
            onSelectOption = {(v: string) => { setUserInput(v); onSend() }}
            />
        }
        {/* Display Message */}
        <section className='flex-1 overflow-y-auto p-4'>
            {messages.map((msg:Message, index) => (
                msg.role === 'user' ? 
                <div className='flex justify-end mt-2' key={index}>
                    <div className='max-w-lg bg-primary text-white px-4 py-2 rounded-lg'>
                        {msg.content}
                    </div>
                </div> :
                <div className='flex justify-start mt-2' key={index}>
                    <div className='max-w-lg bg-gray-200 text-black px-4 py-2 rounded-lg'>
                        {msg.content}
                        {RenderGenerativeUi(msg.ui ?? '')}
                    </div>
                </div>
            ))} 

            {loading && <div className='flex justify-start mt-2'>
                <div className='max-w-lg bg-gray-200 text-black px-4 py-2 rounded-lg'>
                    <Loader className='animate-spin'/>
                </div>
            </div>}
        </section>
        {/* User input */}
        <section>
            <div className='border rounded-2xl p-4 relative'>
                <Textarea placeholder='Start your trip planing journey...' 
                    className='w-full h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none'
                    onChange={(event) => setUserInput(event.target.value??'')}
                    value={userInput}
                />
                <Button size= {'icon'} className='absolute bottom-6 right-6' onClick={()=>onSend()}>
                    <Send className='h-4 w-4'/>
                </Button>
            </div>
        </section>
    </div>
  )
}

export default ChatBox
