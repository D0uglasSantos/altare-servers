export type Escala = {
  id: string;
  data: string;
  hora: string;
  descricao: string;
  servidores: ServidorEscalado[];
  tipo?: string;
  criadoPor?: string;
  dataCriacao?: string;
};

export type ServidorEscalado = {
  id: string;
  nome: string;
  funcao: string;
};

export type Servidor = {
  id: string;
  nome: string;
  tipo: string;
  ativo?: boolean;
};

export type MissaConfig = {
  dia: string;
  hora: string;
  descricao: string;
};
