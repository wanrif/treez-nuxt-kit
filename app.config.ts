export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'treez',
    },
    button: {
      slots: {
        base: [
          'rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75',
          'transition-colors',
        ],
        label: 'truncate',
        leadingIcon: 'shrink-0',
        leadingAvatar: 'shrink-0',
        leadingAvatarSize: '',
        trailingIcon: 'shrink-0',
      },
      variants: {
        buttonGroup: {
          horizontal: 'not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none',
          vertical: 'not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none',
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
        variant: {
          solid: '',
          outline: '',
          soft: '',
          subtle: '',
          ghost: '',
          link: '',
        },
        size: {
          xs: {
            base: 'px-2 py-1 text-xs gap-1',
            leadingIcon: 'size-4',
            leadingAvatarSize: '3xs',
            trailingIcon: 'size-4',
          },
          sm: {
            base: 'px-2.5 py-1.5 text-xs gap-1.5',
            leadingIcon: 'size-4',
            leadingAvatarSize: '3xs',
            trailingIcon: 'size-4',
          },
          md: {
            base: 'px-2.5 py-1.5 text-sm gap-1.5',
            leadingIcon: 'size-5',
            leadingAvatarSize: '2xs',
            trailingIcon: 'size-5',
          },
          lg: {
            base: 'px-3 py-2 text-sm gap-2',
            leadingIcon: 'size-5',
            leadingAvatarSize: '2xs',
            trailingIcon: 'size-5',
          },
          xl: {
            base: 'px-3 py-2 text-base gap-2',
            leadingIcon: 'size-6',
            leadingAvatarSize: 'xs',
            trailingIcon: 'size-6',
          },
        },
        block: {
          true: {
            base: 'w-full justify-center',
            trailingIcon: 'ms-auto',
          },
        },
        square: {
          true: '',
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
        active: {
          true: {
            base: '',
          },
          false: {
            base: '',
          },
        },
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class:
            'text-inverted bg-primary hover:bg-primary/75 disabled:bg-primary aria-disabled:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        },
        {
          color: 'primary',
          variant: 'outline',
          class:
            'ring ring-inset ring-primary/50 text-primary hover:bg-primary/10 disabled:bg-transparent aria-disabled:bg-transparent dark:disabled:bg-transparent dark:aria-disabled:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        },
        {
          color: 'primary',
          variant: 'soft',
          class:
            'text-primary bg-primary/10 hover:bg-primary/15 focus:outline-none focus-visible:bg-primary/15 disabled:bg-primary/10 aria-disabled:bg-primary/10',
        },
        {
          color: 'primary',
          variant: 'subtle',
          class:
            'text-primary ring ring-inset ring-primary/25 bg-primary/10 hover:bg-primary/15 disabled:bg-primary/10 aria-disabled:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        },
        {
          color: 'primary',
          variant: 'ghost',
          class:
            'text-primary hover:bg-primary/10 focus:outline-none focus-visible:bg-primary/10 disabled:bg-transparent aria-disabled:bg-transparent dark:disabled:bg-transparent dark:aria-disabled:bg-transparent',
        },
        {
          color: 'primary',
          variant: 'link',
          class:
            'text-primary hover:text-primary/75 disabled:text-primary aria-disabled:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
        },
        {
          color: 'neutral',
          variant: 'solid',
          class:
            'text-inverted bg-inverted hover:bg-inverted/90 disabled:bg-inverted aria-disabled:bg-inverted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverted',
        },
        {
          color: 'neutral',
          variant: 'outline',
          class:
            'ring ring-inset ring-accented text-default bg-default hover:bg-elevated disabled:bg-default aria-disabled:bg-default focus:outline-none focus-visible:ring-2 focus-visible:ring-inverted',
        },
        {
          color: 'neutral',
          variant: 'soft',
          class:
            'text-default bg-elevated hover:bg-accented/75 focus:outline-none focus-visible:bg-accented/75 disabled:bg-elevated aria-disabled:bg-elevated',
        },
        {
          color: 'neutral',
          variant: 'subtle',
          class:
            'ring ring-inset ring-accented text-default bg-elevated hover:bg-accented/75 disabled:bg-elevated aria-disabled:bg-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-inverted',
        },
        {
          color: 'neutral',
          variant: 'ghost',
          class:
            'text-default hover:bg-elevated focus:outline-none focus-visible:bg-elevated hover:disabled:bg-transparent dark:hover:disabled:bg-transparent hover:aria-disabled:bg-transparent dark:hover:aria-disabled:bg-transparent',
        },
        {
          color: 'neutral',
          variant: 'link',
          class:
            'text-muted hover:text-default disabled:text-muted aria-disabled:text-muted focus:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-inverted',
        },
        {
          color: 'error',
          variant: 'solid',
          class:
            'text-inverted bg-error hover:bg-error/75 disabled:bg-error aria-disabled:bg-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error',
        },
        {
          color: 'error',
          variant: 'outline',
          class:
            'ring ring-inset ring-error/50 text-error hover:bg-error/10 disabled:bg-transparent aria-disabled:bg-transparent dark:disabled:bg-transparent dark:aria-disabled:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-error',
        },
        {
          color: 'error',
          variant: 'soft',
          class:
            'text-error bg-error/10 hover:bg-error/15 focus:outline-none focus-visible:bg-error/15 disabled:bg-error/10 aria-disabled:bg-error/10',
        },
        {
          color: 'error',
          variant: 'subtle',
          class:
            'text-error ring ring-inset ring-error/25 bg-error/10 hover:bg-error/15 disabled:bg-error/10 aria-disabled:bg-error/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-error',
        },
        {
          color: 'error',
          variant: 'ghost',
          class:
            'text-error hover:bg-error/10 focus:outline-none focus-visible:bg-error/10 disabled:bg-transparent aria-disabled:bg-transparent dark:disabled:bg-transparent dark:aria-disabled:bg-transparent',
        },
        {
          color: 'error',
          variant: 'link',
          class:
            'text-error hover:text-error/75 disabled:text-error aria-disabled:text-error focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-error',
        },
        {
          size: 'xs',
          square: true,
          class: 'p-1',
        },
        {
          size: 'sm',
          square: true,
          class: 'p-1.5',
        },
        {
          size: 'md',
          square: true,
          class: 'p-1.5',
        },
        {
          size: 'lg',
          square: true,
          class: 'p-2',
        },
        {
          size: 'xl',
          square: true,
          class: 'p-2',
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
        color: 'primary',
        variant: 'solid',
        size: 'md',
      },
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
    table: {
      slots: {
        root: 'relative overflow-auto',
        base: 'min-w-full overflow-clip bg-(--ui-bg)',
        caption: 'sr-only',
        thead:
          'relative [&>tr]:after:absolute [&>tr]:after:inset-x-0 [&>tr]:after:bottom-0 [&>tr]:after:h-px [&>tr]:after:bg-(--ui-border-accented)',
        tbody:
          'divide-y divide-default [&>tr]:data-[selectable=true]:hover:bg-primary-50 [&>tr]:data-[selectable=true]:focus-visible:outline-primary dark:[&>tr]:data-[selectable=true]:hover:bg-primary-950/30',
        tr: 'data-[selected=true]:bg-primary-50 dark:data-[selected=true]:bg-primary-950/30',
        th: 'px-4 py-3.5 text-sm text-highlighted text-left rtl:text-right font-semibold [&:has([role=checkbox])]:pe-0',
        td: 'p-4 text-sm text-muted whitespace-nowrap [&:has([role=checkbox])]:pe-0',
        empty: 'py-6 text-center text-sm text-muted',
        loading: 'py-6 text-center',
      },
      variants: {
        pinned: {
          true: {
            th: 'sticky bg-default/75 data-[pinned=left]:left-0 data-[pinned=right]:right-0',
            td: 'sticky bg-default/75 data-[pinned=left]:left-0 data-[pinned=right]:right-0',
          },
        },
        sticky: {
          true: {
            thead: 'sticky top-0 inset-x-0 bg-default/75 z-[1] backdrop-blur',
          },
        },
        loading: {
          true: {
            thead: 'after:absolute after:bottom-0 after:inset-x-0 after:h-px',
          },
        },
        loadingAnimation: {
          carousel: '',
          'carousel-inverse': '',
          swing: '',
          elastic: '',
        },
        loadingColor: {
          primary: '',
          secondary: '',
          success: '',
          info: '',
          warning: '',
          error: '',
          neutral: '',
        },
      },
      compoundVariants: [
        {
          loading: true,
          loadingColor: 'primary',
          class: {
            thead: 'after:bg-primary',
          },
        },
        {
          loading: true,
          loadingColor: 'neutral',
          class: {
            thead: 'after:bg-inverted',
          },
        },
        {
          loading: true,
          loadingAnimation: 'carousel',
          class: {
            thead:
              'after:animate-[carousel_2s_ease-in-out_infinite] rtl:after:animate-[carousel-rtl_2s_ease-in-out_infinite]',
          },
        },
        {
          loading: true,
          loadingAnimation: 'carousel-inverse',
          class: {
            thead:
              'after:animate-[carousel-inverse_2s_ease-in-out_infinite] rtl:after:animate-[carousel-inverse-rtl_2s_ease-in-out_infinite]',
          },
        },
        {
          loading: true,
          loadingAnimation: 'swing',
          class: {
            thead: 'after:animate-[swing_2s_ease-in-out_infinite]',
          },
        },
        {
          loading: true,
          loadingAnimation: 'elastic',
          class: {
            thead: 'after:animate-[elastic_2s_ease-in-out_infinite]',
          },
        },
      ],
      defaultVariants: {
        loadingColor: 'primary',
        loadingAnimation: 'carousel',
      },
    },
    toast: {
      slots: {
        root: 'relative group overflow-hidden bg-default shadow-lg rounded-lg ring ring-treez-50/50 dark:ring-treez-900 p-4 flex gap-2.5 focus:outline-none',
        wrapper: 'w-0 flex-1 flex flex-col',
        title: 'text-sm font-medium text-highlighted',
        description: 'text-sm text-muted',
        icon: 'shrink-0 size-5',
        avatar: 'shrink-0',
        avatarSize: '2xl',
        actions: 'flex gap-1.5 shrink-0',
        progress: 'absolute inset-x-0 bottom-0 h-1 z-[-1]',
        close: 'p-0',
      },
      variants: {
        color: {
          primary: {
            root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
            icon: 'text-primary',
            progress: 'bg-primary',
          },
          secondary: {
            root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary',
            icon: 'text-secondary',
            progress: 'bg-secondary',
          },
          success: {
            root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-success',
            icon: 'text-success',
            progress: 'bg-success',
          },
          info: {
            root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-info',
            icon: 'text-info',
            progress: 'bg-info',
          },
          warning: {
            root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-warning',
            icon: 'text-warning',
            progress: 'bg-warning',
          },
          error: {
            root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-error',
            icon: 'text-error',
            progress: 'bg-error',
          },
          neutral: {
            root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-inverted',
            icon: 'text-highlighted',
            progress: 'bg-inverted',
          },
        },
        orientation: {
          horizontal: {
            root: 'items-center',
            actions: 'items-center',
          },
          vertical: {
            root: 'items-start',
            actions: 'items-start mt-2.5',
          },
        },
        title: {
          true: {
            description: 'mt-1',
          },
        },
      },
      defaultVariants: {
        color: 'primary',
      },
    },
  },
})
