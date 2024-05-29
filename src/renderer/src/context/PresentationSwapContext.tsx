import React, { createContext, useState } from "react";
import DialogConfirm from "../components/DialogConfirm";

interface PresentationSwapContextType {
  setSwappingPresentationId: (id: number) => void;
  swappingPresentation: number | null;
  cancelSwappingPresentation: () => void;
  setNewPresentationId: (id: number, callback?: () => void) => void;
}

const PresentationSwapContext = createContext<PresentationSwapContextType>({
  setSwappingPresentationId: () => {},
  swappingPresentation: null,
  cancelSwappingPresentation: () => {},
  setNewPresentationId: () => {},
});

const PresentationSwapContextProvider = ({ children }): React.ReactElement => {
  const [swappingPresentation, setSwappingPresentation] = React.useState<
    number | null
  >(null);

  // Confirmation dialog if there are clashes
  const [confirmationDialogParams, setConfirmationDialogParams] = useState<{
    title: string;
    message: string;
    handleConfirm: () => void;
  }>({
    title: "",
    message: "",
    handleConfirm: () => {},
  });
  const [showConfirmationDialog, setShowDialogConfirm] =
    useState<boolean>(false);

  const setSwappingPresentationId = (id: number): void => {
    setSwappingPresentation(id);
  };

  const cancelSwappingPresentation = (): void => {
    setSwappingPresentation(null);
  };

  const setNewPresentationId = (
    id: number,
    callback: () => void = (): void => {},
  ): void => {
    if (swappingPresentation === null || swappingPresentation === id) return;

    // Check if there are clashes
    const clashingProfessors =
      window.mainController.checkProfessorClashesWhenSwapping(
        swappingPresentation,
        id,
      );

    const result = clashingProfessors.reduce(
      (acc, curr) => acc + curr.length,
      0,
    );
    console.log(clashingProfessors);

    if (result > 0) {
      setConfirmationDialogParams({
        title: "Se detectó un choque de horarios",
        message: `El intercambio causaría un choque para los siguientes profesores: ${clashingProfessors
          .map((clash) => clash.join(", "))
          .join("; ")}. ¿Continuar?`,
        handleConfirm: () => {
          handleSwap(id, callback);
          setShowDialogConfirm(false);
        },
      });
      setShowDialogConfirm(true);
    } else {
      handleSwap(id, callback);
    }
  };

  const handleSwap = (
    id: number,
    callback: () => void = (): void => {},
  ): void => {
    if (swappingPresentation === null) return;

    // Swap presentations
    window.mainController.swapPresentations(swappingPresentation, id);

    setSwappingPresentation(null);
    callback();
  };

  return (
    <PresentationSwapContext.Provider
      value={{
        swappingPresentation,
        setSwappingPresentationId,
        cancelSwappingPresentation,
        setNewPresentationId,
      }}
    >
      {children}
      <DialogConfirm
        title={confirmationDialogParams.title}
        message={confirmationDialogParams.message}
        handleConfirm={confirmationDialogParams.handleConfirm}
        handleCancel={() => {
          setShowDialogConfirm(false);
        }}
        show={showConfirmationDialog}
      />
    </PresentationSwapContext.Provider>
  );
};

export { PresentationSwapContext, PresentationSwapContextProvider };
