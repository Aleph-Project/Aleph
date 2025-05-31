declare module 'lucide-react' {
  import { FC, SVGProps } from 'react'
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number
    color?: string
    strokeWidth?: string | number
  }
  
  export const Search: FC<IconProps>
  export const X: FC<IconProps>
  export const Play: FC<IconProps>
  export const Pause: FC<IconProps>
  export const ArrowLeft: FC<IconProps>
} 