"use client"

import axios from "axios";
import * as z from "zod";
import { useState } from "react";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";

import { ImageIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation";
import { ChatCompletionRequestMessage } from "openai"; 
import { Heading } from "@/components/heading"
import { formSchema } from "./constants";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import { cn } from "@/lib/utils";


const imagePage = () => {
    // reload router 
    const router = useRouter();
    //set messages state 
    const [ messages, setMessages ] = useState<ChatCompletionRequestMessage[]>([]);
    //create form function
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        prompt: " "
      }
    });

  const isLoading = form.formState.isSubmitting; 
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try{
        const userMessage: ChatCompletionRequestMessage = {
          role: "user",
          content: values.prompt,
        };
        const newMessages = [...messages, userMessage];

        const response = await axios.post("/api/conversation", {
            messages: newMessages
        });

        setMessages((current) => [...current, userMessage, response.data]);
        form.reset();

      } catch(error: any){
      //TODO: open Pro Modal
        console.log(error)
      } finally {
        router.refresh();
      }
  }

  return (
    <div>
      <Heading 
        title="Image Generation"
        description="Turn your prompt into an image."
        icon={ImageIcon}
        iconColor="text-pink-700"
        bgColor="bg-pink-700/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2">
                <FormField  name="prompt" render={({field})=>(
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                        <Input  className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent" disabled={isLoading} placeholder="How do I calculate the radius pf a circle?" {...field} />
                    </FormControl>
                  </FormItem>  
                )}/>
              <Button className="col-span-12 lg:col-span-2 w-full" disabled={isLoading}>Generate</Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
            {isLoading && (
                <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                  <Loader />
                </div>
            )}
            {messages.length === 0 && !isLoading && (
                <Empty label="No conversation has started yet" />
            )}
            <div className="flex flex-col-reverse gap-y-4">
                {messages.map((message) =>(
                    <div 
                      className={cn(
                          "p-8 w-full flex items-start gap-x-8 rounded-lg",
                            message.role === "user" ? "bg-white border border-black/10" : "bg-muted"
                        )}      
                      key={message.content}>

                          {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                        <p className="text-sm">
                            {message.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}

export default imagePage