import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styled from 'styled-components';

const Nav = styled.nav`
  background-color: #4285f4;
  padding: 15px 20px;
  color: white;
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: 1px solid white;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <Nav>
      <NavContainer>
        <Logo>HorarioDani</Logo>
        <NavLinks>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/disciplinas">Disciplinas</NavLink>
          <NavLink to="/horarios">Horários</NavLink>
          <NavLink to="/testes">Testes</NavLink>
          <NavLink to="/notas">Notas</NavLink>
          <LogoutButton onClick={handleLogout}>Sair</LogoutButton>
        </NavLinks>
      </NavContainer>
    </Nav>
  );
}