"use client";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useAlertDialogStore from "@/stores/alertDialogStore";
import { X } from "lucide-react";
import { Button } from "./button";

const CommonAlertDialog = () => {
  const { open, title, description, actions, close } = useAlertDialogStore();

  return (
    <AlertDialog open={open || false}>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle className="capitalize">
            {title || "Are you sure?"}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {description || "Are you sure you want to perform this action?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose onClick={close} render={<Button variant="ghost" />}>
            <X />
            Cancel
          </AlertDialogClose>
          {actions && actions.length > 0
            ? actions.map((props, index) => (
                <AlertDialogClose
                  render={<Button />}
                  key={index}
                  {...props}
                  onClick={(e) => {
                    props.onClick?.(e);
                    close();
                  }}
                />
              ))
            : null}
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
};

export default CommonAlertDialog;
