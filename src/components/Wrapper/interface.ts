import type { HTMLAttributes } from "astro/types";
import { cva, type VariantProps } from "class-variance-authority";

export const wrapper = cva("wrapper", {
  variants: {
    size: {
      large: "wrapper--lg",
      medium: "wrapper--sm",
      form: "wrapper--form",
    },
    align: {
      left: "text-start",
      center: "text-center",
      end: "text-right",
    },
    textcolor: {
      black: "color-black-000",
      white: "color-white-000",
      green: "color-green-500",
    },
  },
  compoundVariants: [{ size: "medium", class: "uppercase" }],
});

export interface Props extends VariantProps<typeof wrapper>, HTMLAttributes<"div"> {
  classes?: string;
}
