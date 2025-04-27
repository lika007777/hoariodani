import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #3367d6;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background-color: #f2f2f2;
  }
`;

const ActionButton = styled.button`
  background-color: ${props => props.delete ? '#f44336' : '#4285f4'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  margin-right: 5px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

export default function Disciplinas() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [nome, setNome] = useState('');
  const [professor, setProfessor] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDisciplinas();
  }, []);

  async function fetchDisciplinas() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('disciplinas')
        .select('*')
        .order('nome');
        
      if (error) throw error;
      
      setDisciplinas(data || []);
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error.message);
      alert('Erro ao buscar disciplinas. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      if (editingId) {
        // Atualizar disciplina existente
        const { error } = await supabase
          .from('disciplinas')
          .update({ nome, professor })
          .eq('id', editingId);
          
        if (error) throw error;
        
        alert('Disciplina atualizada com sucesso!');
      } else {
        // Criar nova disciplina
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from('disciplinas')
          .insert([{ nome, professor, user_id: user.id }]);
          
        if (error) throw error;
        
        alert('Disciplina adicionada com sucesso!');
      }
      
      setNome('');
      setProfessor('');
      setEditingId(null);
      fetchDisciplinas();
    } catch (error) {
      console.error('Erro ao salvar disciplina:', error.message);
      alert('Erro ao salvar disciplina. Por favor, tente novamente.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir esta disciplina?')) return;
    
    try {
      const { error } = await supabase
        .from('disciplinas')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      fetchDisciplinas();
      alert('Disciplina excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error.message);
      alert('Erro ao excluir disciplina. Por favor, tente novamente.');
    }
  }

  function handleEdit(disciplina) {
    setNome(disciplina.nome);
    setProfessor(disciplina.professor || '');
    setEditingId(disciplina.id);
  }

  return (
    <Container>
      <h1>Gerenciar Disciplinas</h1>
      
      <Card>
        <h2>{editingId ? 'Editar Disciplina' : 'Adicionar Nova Disciplina'}</h2>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Nome da disciplina"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Nome do professor"
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
          />
          <Button type="submit">
            {editingId ? 'Atualizar' : 'Adicionar'}
          </Button>
          {editingId && (
            <Button 
              type="button" 
              onClick={() => {
                setNome('');
                setProfessor('');
                setEditingId(null);
              }}
              style={{ backgroundColor: '#f44336' }}
            >
              Cancelar
            </Button>
          )}
        </Form>
      </Card>
      
      <Card>
        <h2>Suas Disciplinas</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : disciplinas.length === 0 ? (
          <p>Nenhuma disciplina cadastrada. Adicione sua primeira disciplina acima.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Disciplina</th>
                <th>Professor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {disciplinas.map((disciplina) => (
                <tr key={disciplina.id}>
                  <td>{disciplina.nome}</td>
                  <td>{disciplina.professor || '-'}</td>
                  <td>
                    <ActionButton onClick={() => handleEdit(disciplina)}>
                      Editar
                    </ActionButton>
                    <ActionButton 
                      delete 
                      onClick={() => handleDelete(disciplina.id)}
                    >
                      Excluir
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </Container>
  );
}