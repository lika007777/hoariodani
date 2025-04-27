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

const FormGroup = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
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

const diasSemana = [
  { id: 1, nome: 'Segunda-feira' },
  { id: 2, nome: 'Terça-feira' },
  { id: 3, nome: 'Quarta-feira' },
  { id: 4, nome: 'Quinta-feira' },
  { id: 5, nome: 'Sexta-feira' },
  { id: 6, nome: 'Sábado' },
  { id: 0, nome: 'Domingo' }
];

export default function Horarios() {
  const [horarios, setHorarios] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [disciplinaId, setDisciplinaId] = useState('');
  const [diaSemana, setDiaSemana] = useState(1);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDisciplinas();
    fetchHorarios();
  }, []);

  async function fetchDisciplinas() {
    try {
      const { data, error } = await supabase
        .from('disciplinas')
        .select('*')
        .order('nome');
        
      if (error) throw error;
      
      setDisciplinas(data || []);
      if (data && data.length > 0 && !disciplinaId) {
        setDisciplinaId(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error.message);
    }
  }

  async function fetchHorarios() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('horarios')
        .select(`
          *,
          disciplinas (nome)
        `)
        .order('dia_semana')
        .order('hora_inicio');
        
      if (error) throw error;
      
      setHorarios(data || []);
    } catch (error) {
      console.error('Erro ao buscar horários:', error.message);
      alert('Erro ao buscar horários. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      if (editingId) {
        // Atualizar horário existente
        const { error } = await supabase
          .from('horarios')
          .update({ 
            disciplina_id: disciplinaId,
            dia_semana: diaSemana,
            hora_inicio: horaInicio,
            hora_fim: horaFim
          })
          .eq('id', editingId);
          
        if (error) throw error;
        
        alert('Horário atualizado com sucesso!');
      } else {
        // Criar novo horário
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from('horarios')
          .insert([{ 
            disciplina_id: disciplinaId,
            dia_semana: diaSemana,
            hora_inicio: horaInicio,
            hora_fim: horaFim,
            user_id: user.id
          }]);
          
        if (error) throw error;
        
        alert('Horário adicionado com sucesso!');
      }
      
      resetForm();
      fetchHorarios();
    } catch (error) {
      console.error('Erro ao salvar horário:', error.message);
      alert('Erro ao salvar horário. Por favor, tente novamente.');
    }
  }

  function resetForm() {
    setDisciplinaId(disciplinas.length > 0 ? disciplinas[0].id : '');
    setDiaSemana(1);
    setHoraInicio('');
    setHoraFim('');
    setEditingId(null);
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir este horário?')) return;
    
    try {
      const { error } = await supabase
        .from('horarios')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      fetchHorarios();
      alert('Horário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir horário:', error.message);
      alert('Erro ao excluir horário. Por favor, tente novamente.');
    }
  }

  function handleEdit(horario) {
    setDisciplinaId(horario.disciplina_id);
    setDiaSemana(horario.dia_semana);
    setHoraInicio(horario.hora_inicio);
    setHoraFim(horario.hora_fim);
    setEditingId(horario.id);
  }

  function getDiaSemana(id) {
    return diasSemana.find(dia => dia.id === id)?.nome || '';
  }

  return (
    <Container>
      <h1>Gerenciar Horários</h1>
      
      <Card>
        <h2>{editingId ? 'Editar Horário' : 'Adicionar Novo Horário'}</h2>
        <Form onSubmit={handleSubmit}>
          <Select
            value={disciplinaId}
            onChange={(e) => setDisciplinaId(e.target.value)}
            required
          >
            <option value="">Selecione uma disciplina</option>
            {disciplinas.map((disciplina) => (
              <option key={disciplina.id} value={disciplina.id}>
                {disciplina.nome}
              </option>
            ))}
          </Select>
          
          <Select
            value={diaSemana}
            onChange={(e) => setDiaSemana(Number(e.target.value))}
            required
          >
            {diasSemana.map((dia) => (
              <option key={dia.id} value={dia.id}>
                {dia.nome}
              </option>
            ))}
          </Select>
          
          <FormGroup>
            <div>
              <label htmlFor="hora-inicio">Hora de Início:</label>
              <Input
                id="hora-inicio"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="hora-fim">Hora de Término:</label>
              <Input
                id="hora-fim"
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                required
              />
            </div>
          </FormGroup>
          
          <Button type="submit">
            {editingId ? 'Atualizar' : 'Adicionar'}
          </Button>
          
          {editingId && (
            <Button 
              type="button" 
              onClick={resetForm}
              style={{ backgroundColor: '#f44336' }}
            >
              Cancelar
            </Button>
          )}
        </Form>
      </Card>
      
      <Card>
        <h2>Seus Horários</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : horarios.length === 0 ? (
          <p>Nenhum horário cadastrado. Adicione seu primeiro horário acima.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Dia</th>
                <th>Disciplina</th>
                <th>Horário</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {horarios.map((horario) => (
                <tr key={horario.id}>
                  <td>{getDiaSemana(horario.dia_semana)}</td>
                  <td>{horario.disciplinas.nome}</td>
                  <td>{horario.hora_inicio} - {horario.hora_fim}</td>
                  <td>
                    <ActionButton 
                      onClick={() => handleEdit(horario)}
                    >
                      Editar
                    </ActionButton>
                    <ActionButton 
                      delete 
                      onClick={() => handleDelete(horario.id)}
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