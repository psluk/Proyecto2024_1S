import React, { createContext } from "react";

interface Session {
  name: string;
  email: string;
  type: number;
}

interface SessionContextType {
  session: Session | null;
  login: (name: string, email: string, type: number) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

const SessionContextProvider = ({ children }) => {
  const [session, setSession] = React.useState<Session | null>(null);

  const login = (name: string, email: string, type: number) => {
    setSession({ name, email, type });
  };

  const logout = () => {
    setSession(null);
  }

  return (
    <SessionContext.Provider value={{ session, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export { SessionContext, SessionContextProvider };
