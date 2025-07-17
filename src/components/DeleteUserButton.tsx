"use client";
import { authClient } from "@/lib/auth-client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User } from "better-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoaderCircle, Trash2 } from "lucide-react";

export default function DeleteUserButton({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const deleteUser = async () => {
    await authClient.admin.removeUser(
      { userId: user.id },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          setLoading(false);
          toast.success("Conta deletada com sucesso");
          router.refresh();
        },
        onError: () => {
          setLoading(false);
          toast.error("Erro ao deletar conta.");
        },
      }
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Excluir</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o usuário{" "}
            <span className="font-medium">{user.name}</span>? Esta ação não pode
            ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={deleteUser}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600"
          >
            {loading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
