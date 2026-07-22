'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  contactFormSchema,
  CONTACT_SUBJECT_OPTIONS,
  type ContactFormInput,
} from '@bharatmart/validation'
import { Button, Input, Label, toast } from '@bharatmart/ui'
import { submitContactForm } from './actions'

export function ContactForm() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: 'general',
      message: '',
    },
  })

  async function onSubmit(values: ContactFormInput) {
    const result = await submitContactForm(values)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Message sent - we will get back to you soon.')
    reset()
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-medium uppercase tracking-wide text-[#514534]" htmlFor="name">
            Full Name
          </Label>
          <Input
            className="h-12 rounded-lg border-[#d6c4ad] bg-[#fff8f0]"
            id="name"
            placeholder="Arjun Singh"
            {...register('name')}
          />
          {errors.name ? <p className="text-sm text-[#ba1a1a]">{errors.name.message}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-medium uppercase tracking-wide text-[#514534]" htmlFor="email">
            Email Address
          </Label>
          <Input
            className="h-12 rounded-lg border-[#d6c4ad] bg-[#fff8f0]"
            id="email"
            placeholder="arjun@example.co.uk"
            type="email"
            {...register('email')}
          />
          {errors.email ? <p className="text-sm text-[#ba1a1a]">{errors.email.message}</p> : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs font-medium uppercase tracking-wide text-[#514534]" htmlFor="subject">
          Subject
        </Label>
        <Controller
          control={control}
          name="subject"
          render={({ field }) => (
            <select
              className="h-12 w-full appearance-none rounded-lg border border-[#d6c4ad] bg-[#fff8f0] px-4 text-sm outline-none focus:border-[#7f5700] focus:ring-2 focus:ring-[#7f5700]/20"
              id="subject"
              {...field}
            >
              {CONTACT_SUBJECT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        />
        {errors.subject ? <p className="text-sm text-[#ba1a1a]">{errors.subject.message}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs font-medium uppercase tracking-wide text-[#514534]" htmlFor="message">
          Your Message
        </Label>
        <textarea
          className="min-h-[140px] w-full resize-none rounded-lg border border-[#d6c4ad] bg-[#fff8f0] px-4 py-3 text-sm outline-none focus:border-[#7f5700] focus:ring-2 focus:ring-[#7f5700]/20"
          id="message"
          placeholder="How can we assist you today?"
          rows={5}
          {...register('message')}
        />
        {errors.message ? <p className="text-sm text-[#ba1a1a]">{errors.message.message}</p> : null}
      </div>

      <Button
        className="w-full bg-[#7f5700] px-8 py-6 text-base font-semibold text-white hover:bg-[#e8a317] hover:text-[#5b3d00] md:w-auto"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  )
}
