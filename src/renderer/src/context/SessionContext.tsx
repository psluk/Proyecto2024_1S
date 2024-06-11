import React, { createContext } from "react";

interface Session {
  name: string;
  email: string;
  type: string;
}

interface SessionContextType {
  session: Session | null;
  login: (name: string, email: string, type: string) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

const SessionContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => {
  const [session, setSession] = React.useState<Session | null>(null);

  const login = (name: string, email: string, type: string): void => {
    setSession({ name, email, type });
  };

  const logout = (): void => {
    setSession(null);
  };

  return (
    <SessionContext.Provider value={{ session, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export { SessionContext, SessionContextProvider };
