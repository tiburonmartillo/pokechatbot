import { createRoot } from 'react-dom/client';
import { EmbeddableChat } from './app/EmbeddableChat';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(<EmbeddableChat />);
