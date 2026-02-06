import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Grid,
  Dialog,
  DialogContent,
  IconButton,
  Divider,
} from '@mui/material';
import { X } from 'lucide-react';

const POKE_API = 'https://pokeapi.co/api/v2';

interface PokemonListItem {
  name: string;
  url: string;
}

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other?: { 'official-artwork'?: { front_default?: string } };
  };
  types: { type: { name: string } }[];
  height: number;
  weight: number;
  abilities?: { ability: { name: string }; is_hidden: boolean }[];
  stats?: { base_stat: number; stat: { name: string } }[];
}

const theme = createTheme({
  palette: {
    primary: { main: '#FFCB05' },
    secondary: { main: '#3B5CA7' },
    background: { default: '#F5F5F5', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: "'Kumbh Sans', system-ui, sans-serif",
  },
});

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const STAT_NAMES: Record<string, string> = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'At. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidad',
};

export function PokemonPage() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  useEffect(() => {
    if (document.querySelector('script[data-chatbot-url]')) return;
    const script = document.createElement('script');
    script.src = '/embed.js';
    script.setAttribute('data-chatbot-url', window.location.origin);
    script.setAttribute('data-api-base-url', 'https://pokeapi.co/api/v2');
    script.setAttribute('data-api-endpoints', '/pokemon?limit=50');
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    async function fetchPokemon() {
      try {
        const res = await fetch(`${POKE_API}/pokemon?limit=24`);
        const data = await res.json();
        const list: PokemonListItem[] = data.results;

        const details = await Promise.all(
          list.map((p) => fetch(p.url).then((r) => r.json()))
        );
        setPokemon(details);
      } catch (err) {
        setError('Error al cargar los Pokémon');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPokemon();
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress size={48} />
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Box p={4} textAlign="center">
          <Typography color="error">{error}</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          py: 4,
          px: 2,
        }}
      >
        <Box maxWidth={1200} mx="auto">
          <Typography
            variant="h3"
            component="h1"
            sx={{
              mb: 1,
              color: 'secondary.main',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            Pokédex
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, color: 'text.secondary', textAlign: 'center' }}
          >
            Explora los Pokémon. Pregunta al asistente sobre cualquiera de ellos.
          </Typography>

          <Grid container spacing={3}>
            {pokemon.map((p) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPokemon(p)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPokemon(p);
                    }
                  }}
                  sx={{
                    height: '100%',
                    borderRadius: 2,
                    boxShadow: 2,
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', pt: 3 }}>
                    <Box
                      component="img"
                      src={p.sprites.front_default}
                      alt={p.name}
                      sx={{ width: 96, height: 96, mb: 1 }}
                    />
                    <Typography variant="h6" fontWeight={600}>
                      #{p.id} {capitalize(p.name)}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {p.types.map((t) => (
                        <Chip
                          key={t.type.name}
                          label={capitalize(t.type.name)}
                          size="small"
                          sx={{ bgcolor: 'primary.main', color: 'black', fontWeight: 600 }}
                        />
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Altura: {p.height / 10}m · Peso: {p.weight / 10}kg
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Dialog
          open={!!selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
          maxWidth="sm"
          fullWidth
          aria-labelledby="pokemon-dialog-title"
          slotProps={{
            backdrop: { sx: { zIndex: 999998 } },
          }}
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden',
              zIndex: 999999,
            },
          }}
        >
          {selectedPokemon && (
            <>
              <Box
                sx={{
                  position: 'relative',
                  bgcolor: 'secondary.main',
                  color: 'white',
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPokemon(null);
                  }}
                  aria-label="Cerrar"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                  }}
                >
                  <X size={24} />
                </IconButton>
                <Box
                  component="img"
                  src={
                    selectedPokemon.sprites.other?.['official-artwork']?.front_default ||
                    selectedPokemon.sprites.front_default
                  }
                  alt={selectedPokemon.name}
                  sx={{ width: 180, height: 180, mb: 1 }}
                />
                <Typography id="pokemon-dialog-title" variant="h4" component="h2" fontWeight={700}>
                  #{selectedPokemon.id} {capitalize(selectedPokemon.name)}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {selectedPokemon.types.map((t) => (
                    <Chip
                      key={t.type.name}
                      label={capitalize(t.type.name)}
                      size="small"
                      sx={{ bgcolor: 'primary.main', color: 'black', fontWeight: 600 }}
                    />
                  ))}
                </Box>
              </Box>
              <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Altura
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedPokemon.height / 10} m
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Peso
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedPokemon.weight / 10} kg
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Habilidades
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                  {(selectedPokemon.abilities || []).map((a) => (
                    <Chip
                      key={a.ability.name}
                      label={capitalize(a.ability.name.replace(/-/g, ' '))}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Estadísticas base
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {(selectedPokemon.stats || []).map((s) => (
                    <Box key={s.stat.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ width: 100 }}>
                        {STAT_NAMES[s.stat.name] || s.stat.name}
                      </Typography>
                      <Box
                        sx={{
                          flex: 1,
                          height: 8,
                          bgcolor: 'grey.200',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            width: `${Math.min(s.base_stat, 255) / 2.55}%`,
                            height: '100%',
                            bgcolor: 'primary.main',
                            borderRadius: 1,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight={600} sx={{ width: 30 }}>
                        {s.base_stat}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </DialogContent>
            </>
          )}
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
