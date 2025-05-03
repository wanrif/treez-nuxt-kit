export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
    },
    input: {
      slots: {
        root: 'relative inline-flex items-center',
        base: [
          'w-full rounded-[calc(var(--ui-radius)*1.5)] border-0 placeholder:text-(--ui-text-dimmed) focus:outline-none disabled:cursor-not-allowed disabled:opacity-75',
          'transition-colors',
        ],
        leading: 'absolute inset-y-0 start-0 flex items-center',
        leadingIcon: 'shrink-0 text-(--ui-text-dimmed)',
        leadingAvatar: 'shrink-0',
        leadingAvatarSize: '',
        trailing: 'absolute inset-y-0 end-0 flex items-center',
        trailingIcon: 'shrink-0 text-(--ui-text-dimmed)',
      },
      variants: {
        buttonGroup: {
          horizontal: {
            root: 'group',
            base: 'group-not-only:group-first:rounded-e-none group-not-only:group-last:rounded-s-none group-not-last:group-not-first:rounded-none',
          },
          vertical: {
            root: 'group',
            base: 'group-not-only:group-first:rounded-b-none group-not-only:group-last:rounded-t-none group-not-last:group-not-first:rounded-none',
          },
        },
        size: {
          xs: {
            base: 'px-2 py-1 text-xs gap-1',
            leading: 'ps-2',
            trailing: 'pe-2',
            leadingIcon: 'size-4',
            leadingAvatarSize: '3xs',
            trailingIcon: 'size-4',
          },
          sm: {
            base: 'px-2.5 py-1.5 text-xs gap-1.5',
            leading: 'ps-2.5',
            trailing: 'pe-2.5',
            leadingIcon: 'size-4',
            leadingAvatarSize: '3xs',
            trailingIcon: 'size-4',
          },
          md: {
            base: 'px-2.5 py-1.5 text-sm gap-1.5',
            leading: 'ps-2.5',
            trailing: 'pe-2.5',
            leadingIcon: 'size-5',
            leadingAvatarSize: '2xs',
            trailingIcon: 'size-5',
          },
          lg: {
            base: 'px-3 py-2 text-sm gap-2',
            leading: 'ps-3',
            trailing: 'pe-3',
            leadingIcon: 'size-5',
            leadingAvatarSize: '2xs',
            trailingIcon: 'size-5',
          },
          xl: {
            base: 'px-3 py-2 text-base gap-2',
            leading: 'ps-3',
            trailing: 'pe-3',
            leadingIcon: 'size-6',
            leadingAvatarSize: 'xs',
            trailingIcon: 'size-6',
          },
        },
        variant: {
          outline: 'text-(--ui-text-highlighted) bg-(--ui-bg) ring ring-inset ring-(--ui-border-accented)',
          soft: 'text-(--ui-text-highlighted) bg-(--ui-bg-elevated)/50 hover:bg-(--ui-bg-elevated) focus:bg-(--ui-bg-elevated) disabled:bg-(--ui-bg-elevated)/50',
          subtle: 'text-(--ui-text-highlighted) bg-(--ui-bg-elevated) ring ring-inset ring-(--ui-border-accented)',
          ghost:
            'text-(--ui-text-highlighted) bg-transparent hover:bg-(--ui-bg-elevated) focus:bg-(--ui-bg-elevated) disabled:bg-transparent dark:disabled:bg-transparent',
          none: 'text-(--ui-text-highlighted) bg-transparent',
        },
        color: {
          primary: '',
          secondary: '',
          success: '',
          info: '',
          warning: '',
          error: '',
          neutral: '',
        },
        leading: {
          true: '',
        },
        trailing: {
          true: '',
        },
        loading: {
          true: '',
        },
        highlight: {
          true: '',
        },
        type: {
          file: 'file:me-1.5 file:font-medium file:text-(--ui-text-muted) file:outline-none',
        },
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: ['outline', 'subtle'],
          class: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--ui-primary)',
        },
        {
          color: 'primary',
          highlight: true,
          class: 'ring ring-inset ring-(--ui-primary)',
        },
        {
          color: 'neutral',
          variant: ['outline', 'subtle'],
          class: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--ui-border-inverted)',
        },
        {
          color: 'neutral',
          highlight: true,
          class: 'ring ring-inset ring-(--ui-border-inverted)',
        },
        {
          leading: true,
          size: 'xs',
          class: 'ps-7',
        },
        {
          leading: true,
          size: 'sm',
          class: 'ps-8',
        },
        {
          leading: true,
          size: 'md',
          class: 'ps-9',
        },
        {
          leading: true,
          size: 'lg',
          class: 'ps-10',
        },
        {
          leading: true,
          size: 'xl',
          class: 'ps-11',
        },
        {
          trailing: true,
          size: 'xs',
          class: 'pe-7',
        },
        {
          trailing: true,
          size: 'sm',
          class: 'pe-8',
        },
        {
          trailing: true,
          size: 'md',
          class: 'pe-9',
        },
        {
          trailing: true,
          size: 'lg',
          class: 'pe-10',
        },
        {
          trailing: true,
          size: 'xl',
          class: 'pe-11',
        },
        {
          loading: true,
          leading: true,
          class: {
            leadingIcon: 'animate-spin',
          },
        },
        {
          loading: true,
          leading: false,
          trailing: true,
          class: {
            trailingIcon: 'animate-spin',
          },
        },
      ],
      defaultVariants: {
        size: 'md',
        color: 'primary',
        variant: 'outline',
      },
    },
    modal: {
      slots: {
        overlay: 'fixed inset-0 bg-(--ui-bg-elevated)/75',
        content: 'fixed bg-(--ui-bg) divide-y divide-(--ui-border) border-none flex flex-col focus:outline-none',
        header: 'flex items-center gap-1.5 p-4 sm:px-6 min-h-16',
        wrapper: '',
        body: 'flex-1 overflow-y-auto p-4 sm:p-6',
        footer: 'flex items-center gap-1.5 p-4 sm:px-6',
        title: 'text-highlighted font-semibold',
        description: 'mt-1 text-muted text-sm',
        close: 'absolute top-4 end-4',
      },
      variants: {
        transition: {
          true: {
            overlay:
              'data-[state=open]:animate-[fade-in_200ms_ease-out] data-[state=closed]:animate-[fade-out_200ms_ease-in]',
            content:
              'data-[state=open]:animate-[scale-in_200ms_ease-out] data-[state=closed]:animate-[scale-out_200ms_ease-in]',
          },
        },
        fullscreen: {
          true: {
            content: 'inset-0',
          },
          false: {
            content:
              'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-lg max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] rounded-lg shadow-lg',
          },
        },
      },
    },
  },
})
