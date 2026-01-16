import { AlertDialog, AlertDialogClose } from "@/components/ui/alert-dialog";
import { ButtonProps } from "@/components/ui/button";
import { ComponentProps } from "react";
import { create, StateCreator } from "zustand";

export type AlertDialogState = Omit<ComponentProps<typeof AlertDialog>, "onOpen"> & {
    title?: string
    description?: string
    actions?: (ComponentProps<typeof AlertDialogClose> & { variant?: ButtonProps["variant"] })[]
}
export type AlertDialogActions = {
    onOpen: (params: { title?: string, description?: string, actions?: AlertDialogState["actions"] }) => void
    close: () => void
}

const alertDialogStore: StateCreator<AlertDialogState & AlertDialogActions> = ((set) => ({
    open: false,
    title: undefined,
    description: undefined,
    actions: undefined,
    onOpen: ({ title, description, actions }) => set(() => ({
        title,
        description,
        actions,
        open: true,
    })),
    close: () => set(() => ({
        title: undefined,
        description: undefined,
        actions: undefined,
        open: false,
    })),
}));

export const useAlertDialogStore = create<AlertDialogState & AlertDialogActions>(alertDialogStore);

export default useAlertDialogStore;
