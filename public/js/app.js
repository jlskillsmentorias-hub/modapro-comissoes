// Main Application Logic for ATELIER VESTT
document.addEventListener('DOMContentLoaded', () => {
  const state = {
    currentPeriod: '2026-10',
    sellers: [],
    categories: [],
    ranking: [],
    campaigns: [],
    dashboard: null,
    selectedSellerForSim: null,
    currentUser: null,
    authToken: localStorage.getItem('atelier_token') || null,
    demoUsers: [],
    allUsers: []
  };

  const { sfx, triggerConfetti, showToast, formatCurrency } = window.gamification;

  // DOM Elements
  const periodSelect = document.getElementById('periodSelect');
  const companyGoalPeriodText = document.getElementById('companyGoalPeriodText');
  const companyCurrentSales = document.getElementById('companyCurrentSales');
  const companyTargetSales = document.getElementById('companyTargetSales');
  const companyPercentBadge = document.getElementById('companyPercentBadge');
  const companyProgressFill = document.getElementById('companyProgressFill');
  const companyGoalFooterStatus = document.getElementById('companyGoalFooterStatus');

  const kpiTotalSales = document.getElementById('kpiTotalSales');
  const kpiSalesCount = document.getElementById('kpiSalesCount');
  const kpiTotalCommission = document.getElementById('kpiTotalCommission');
  const kpiAvgTicket = document.getElementById('kpiAvgTicket');
  const kpiTopSeller = document.getElementById('kpiTopSeller');
  const kpiTopSellerTotal = document.getElementById('kpiTopSellerTotal');

  const campaignBanner = document.getElementById('campaignBanner');
  const ribbonTitle = document.getElementById('ribbonTitle');
  const ribbonDesc = document.getElementById('ribbonDesc');
  const ribbonBadge = document.getElementById('ribbonBadge');

  const podiumStage = document.getElementById('podiumStage');
  const rankingTableBody = document.getElementById('rankingTableBody');
  const campaignsGrid = document.getElementById('campaignsGrid');
  const salesTableBody = document.getElementById('salesTableBody');

  // Auth & Role DOM Elements
  const modalLogin = document.getElementById('modalLogin');
  const formLogin = document.getElementById('formLogin');
  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  const btnTogglePwd = document.getElementById('btnTogglePwd');
  const loginAlert = document.getElementById('loginAlert');
  const loginAlertMsg = document.getElementById('loginAlertMsg');
  const demoButtonsGrid = document.getElementById('demoButtonsGrid');
  const btnSwitchUser = document.getElementById('btnSwitchUser');
  const btnLogout = document.getElementById('btnLogout');

  const navUserCapsule = document.getElementById('navUserCapsule');
  const navUserAvatar = document.getElementById('navUserAvatar');
  const navUserName = document.getElementById('navUserName');
  const navUserRole = document.getElementById('navUserRole');

  const roleAccessBanner = document.getElementById('roleAccessBanner');
  const roleBannerIcon = document.getElementById('roleBannerIcon');
  const roleBannerText = document.getElementById('roleBannerText');
  const roleBannerBadge = document.getElementById('roleBannerBadge');

  const tabBtnUsers = document.getElementById('tabBtnUsers');
  const usersTableBody = document.getElementById('usersTableBody');
  const modalNewUser = document.getElementById('modalNewUser');
  const btnOpenNewUserModal = document.getElementById('btnOpenNewUserModal');
  const btnCloseNewUserModal = document.getElementById('btnCloseNewUserModal');
  const btnCancelNewUser = document.getElementById('btnCancelNewUser');
  const formNewUser = document.getElementById('formNewUser');
  const newUserSellerId = document.getElementById('newUserSellerId');

  // User Management Admin Panel DOM Elements
  const statTotalUsers = document.getElementById('statTotalUsers');
  const statAdminUsers = document.getElementById('statAdminUsers');
  const statEmployeeUsers = document.getElementById('statEmployeeUsers');
  const statLinkedSellers = document.getElementById('statLinkedSellers');

  const inputSearchUsers = document.getElementById('inputSearchUsers');
  const selectRoleFilter = document.getElementById('selectRoleFilter');
  const btnRefreshUsersList = document.getElementById('btnRefreshUsersList');

  const modalEditUser = document.getElementById('modalEditUser');
  const formEditUser = document.getElementById('formEditUser');
  const editUserId = document.getElementById('editUserId');
  const editUserUsername = document.getElementById('editUserUsername');
  const editUserName = document.getElementById('editUserName');
  const editUserRole = document.getElementById('editUserRole');
  const editUserSellerId = document.getElementById('editUserSellerId');
  const editUserPassword = document.getElementById('editUserPassword');
  const btnCloseEditUserModal = document.getElementById('btnCloseEditUserModal');
  const btnCancelEditUser = document.getElementById('btnCancelEditUser');

  const modalResetUserPwd = document.getElementById('modalResetUserPwd');
  const formResetUserPwd = document.getElementById('formResetUserPwd');
  const resetPwdUserId = document.getElementById('resetPwdUserId');
  const resetPwdTargetName = document.getElementById('resetPwdTargetName');
  const resetPwdTargetUsername = document.getElementById('resetPwdTargetUsername');
  const resetPwdNewPassword = document.getElementById('resetPwdNewPassword');
  const btnGenRandomPwd = document.getElementById('btnGenRandomPwd');
  const btnCloseResetPwdModal = document.getElementById('btnCloseResetPwdModal');
  const btnCancelResetPwd = document.getElementById('btnCancelResetPwd');

  const sellerLockNotice = document.getElementById('sellerLockNotice');
  const filterMySalesWrapper = document.getElementById('filterMySalesWrapper');
  const chkOnlyMySales = document.getElementById('chkOnlyMySales');

  // Modals
  const modalNewSale = document.getElementById('modalNewSale');
  const btnOpenNewSaleModal = document.getElementById('btnOpenNewSaleModal');
  const btnCloseSaleModal = document.getElementById('btnCloseSaleModal');
  const btnCancelSale = document.getElementById('btnCancelSale');
  const formNewSale = document.getElementById('formNewSale');
  const saleSeller = document.getElementById('saleSeller');
  const saleCategory = document.getElementById('saleCategory');
  const saleAmount = document.getElementById('saleAmount');
  const previewBaseRate = document.getElementById('previewBaseRate');
  const previewBonusRate = document.getElementById('previewBonusRate');
  const previewCommissionTotal = document.getElementById('previewCommissionTotal');

  const modalNewCampaign = document.getElementById('modalNewCampaign');
  const btnOpenNewCampaignModal = document.getElementById('btnOpenNewCampaignModal');
  const btnCreateCampaignTab = document.getElementById('btnCreateCampaignTab');
  const btnCloseCampaignModal = document.getElementById('btnCloseCampaignModal');
  const btnCancelCampaign = document.getElementById('btnCancelCampaign');
  const formNewCampaign = document.getElementById('formNewCampaign');

  const modalSellerDetails = document.getElementById('modalSellerDetails');
  const btnCloseSellerModal = document.getElementById('btnCloseSellerModal');
  const modalSellerName = document.getElementById('modalSellerName');
  const modalSellerBody = document.getElementById('modalSellerBody');

  const btnResetSeed = document.getElementById('btnResetSeed');

  // Simulator Elements
  const simulatorSellerSelect = document.getElementById('simulatorSellerSelect');
  const sellerProfileArea = document.getElementById('sellerProfileArea');
  const simSlider = document.getElementById('simSlider');
  const simSliderVal = document.getElementById('simSliderVal');
  const simExtraCommission = document.getElementById('simExtraCommission');
  const simRateNote = document.getElementById('simRateNote');
  const simNewTotal = document.getElementById('simNewTotal');
  const simNewPercent = document.getElementById('simNewPercent');
  const simRankForecast = document.getElementById('simRankForecast');
  const simRankDiff = document.getElementById('simRankDiff');
  const simMotivationText = document.getElementById('simMotivationText');

  // API helper with authentication token injection
  async function apiRequest(url, options = {}) {
    options.headers = options.headers || {};
    if (state.authToken) {
      options.headers['Authorization'] = `Bearer ${state.authToken}`;
    }
    const res = await fetch(url, options);
    if (res.status === 401) {
      state.authToken = null;
      state.currentUser = null;
      localStorage.removeItem('atelier_token');
      openModal(modalLogin);
      throw new Error('Sessão expirada. Por favor faça login.');
    }
    return res;
  }

  // 1. Initial Setup
  async function init() {
    setupTabs();
    setupEventListeners();
    await checkAuthAndInit();
    await loadCategories();
    await loadInitialData();
  }

  // Authentication & Session verification
  async function checkAuthAndInit() {
    if (state.authToken) {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${state.authToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          state.currentUser = data.user;
          closeModal(modalLogin);
        } else {
          state.authToken = null;
          state.currentUser = null;
          localStorage.removeItem('atelier_token');
        }
      } catch (e) {
        state.authToken = null;
        state.currentUser = null;
        localStorage.removeItem('atelier_token');
      }
    }

    await loadDemoUsers();

    if (!state.currentUser) {
      openModal(modalLogin);
    }

    applyRolePermissions();
  }

  async function loadDemoUsers() {
    try {
      const res = await fetch('/api/auth/demo-users');
      if (res.ok) {
        state.demoUsers = await res.json();
        renderDemoButtons(state.demoUsers);
      }
    } catch (e) {
      console.error('Error loading demo users:', e);
    }
  }

  function renderDemoButtons(users) {
    if (!demoButtonsGrid) return;
    demoButtonsGrid.innerHTML = users.slice(0, 4).map(u => {
      const isAdmin = u.role === 'admin';
      return `
        <div class="demo-user-card ${isAdmin ? 'admin-card' : 'employee-card'}" data-username="${u.username}" data-password="${u.demo_password}">
          <img src="${u.avatar}" alt="${u.name}">
          <div class="demo-user-info">
            <div class="demo-user-name">${u.name}</div>
            <div class="demo-user-sub">${isAdmin ? '🛡️ Admin • senha: ' + u.demo_password : (u.seller_nickname || 'Consultor') + ' • senha: ' + u.demo_password}</div>
          </div>
          <span class="demo-user-pill ${isAdmin ? 'user-badge-admin' : 'user-badge-employee'}">${isAdmin ? 'ADMIN' : 'VENDEDOR'}</span>
        </div>
      `;
    }).join('');

    demoButtonsGrid.querySelectorAll('.demo-user-card').forEach(card => {
      card.addEventListener('click', async () => {
        const uname = card.getAttribute('data-username');
        const pwd = card.getAttribute('data-password');
        loginUsername.value = uname;
        loginPassword.value = pwd;
        await handleLogin(uname, pwd);
      });
    });
  }

  async function handleLogin(username, password) {
    loginAlert.style.display = 'none';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        loginAlertMsg.textContent = data.error || 'Credenciais inválidas.';
        loginAlert.style.display = 'flex';
        return;
      }

      state.authToken = data.token;
      state.currentUser = data.user;
      localStorage.setItem('atelier_token', data.token);

      closeModal(modalLogin);
      formLogin.reset();
      applyRolePermissions();
      sfx.playSuccess();
      showToast(
        `Bem-vindo(a), ${data.user.name}!`,
        data.user.role === 'admin' ? '🛡️ Acesso total de Administrador liberado.' : '💼 Painel do Consultor pronto para vendas!',
        data.user.role === 'admin' ? '👑' : '✨'
      );
      await refreshAllData();
    } catch (err) {
      loginAlertMsg.textContent = 'Erro ao conectar: ' + err.message;
      loginAlert.style.display = 'flex';
    }
  }

  async function handleLogout() {
    try {
      if (state.authToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${state.authToken}` }
        });
      }
    } catch (e) {}

    state.authToken = null;
    state.currentUser = null;
    localStorage.removeItem('atelier_token');
    applyRolePermissions();
    openModal(modalLogin);
    showToast('Sessão Encerrada', 'Até breve!', '👋');
  }

  function applyRolePermissions() {
    const user = state.currentUser;
    if (!user) {
      navUserName.textContent = 'Não conectado';
      navUserRole.textContent = 'Visitante';
      navUserRole.className = 'badge-role';
      roleAccessBanner.style.display = 'none';
      return;
    }

    roleAccessBanner.style.display = 'flex';
    navUserName.textContent = user.name;
    navUserAvatar.src = user.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80';

    if (user.role === 'admin') {
      navUserAvatar.className = 'user-avatar-tiny avatar-admin';
      navUserRole.textContent = '🛡️ Admin';
      navUserRole.className = 'badge-role badge-admin';

      roleAccessBanner.className = 'role-access-banner role-banner-admin';
      roleBannerIcon.textContent = '🛡️';
      roleBannerText.textContent = 'Modo Administrador Ativo: Permissão irrestrita para gerenciar metas globais, campanhas sazonais e configurações.';
      roleBannerBadge.textContent = 'ADMINISTRADOR (TOTAL)';

      // Admin controls visible
      btnOpenNewCampaignModal.style.display = 'inline-flex';
      btnResetSeed.style.display = 'inline-flex';
      btnCreateCampaignTab.style.display = 'inline-flex';
      if (tabBtnUsers) tabBtnUsers.style.display = 'inline-flex';
      if (filterMySalesWrapper) filterMySalesWrapper.style.display = 'none';

      // Sales form
      saleSeller.disabled = false;
      if (sellerLockNotice) sellerLockNotice.style.display = 'none';
      simulatorSellerSelect.disabled = false;
    } else {
      // Employee role
      navUserAvatar.className = 'user-avatar-tiny avatar-employee';
      navUserRole.textContent = `💼 ${user.seller_info?.badge || 'Consultor'}`;
      navUserRole.className = 'badge-role badge-employee';

      roleAccessBanner.className = 'role-access-banner role-banner-employee';
      roleBannerIcon.textContent = '👗';
      roleBannerText.textContent = `Modo Consultor(a): Bem-vindo(a), ${user.name}! Acompanhe suas vendas individuais, ranking e comissões garantidas.`;
      roleBannerBadge.textContent = 'FUNCIONÁRIO (CONSULTOR)';

      // Restrict admin controls
      btnOpenNewCampaignModal.style.display = 'none';
      btnResetSeed.style.display = 'none';
      btnCreateCampaignTab.style.display = 'none';
      if (tabBtnUsers) tabBtnUsers.style.display = 'none';
      if (filterMySalesWrapper) filterMySalesWrapper.style.display = 'flex';

      // Lock sales to current seller
      if (user.seller_id) {
        saleSeller.value = user.seller_id;
        saleSeller.disabled = true;
        if (sellerLockNotice) {
          sellerLockNotice.style.display = 'flex';
          sellerLockNotice.innerHTML = `<span>🔒</span> Venda vinculada exclusivamente ao seu perfil (<strong>${user.name}</strong>).`;
        }

        // Simulator focuses on this employee
        simulatorSellerSelect.value = user.seller_id;
        if (state.ranking && state.ranking.length > 0) {
          const sellerObj = state.ranking.find(r => r.id === user.seller_id);
          if (sellerObj) {
            state.selectedSellerForSim = sellerObj;
            renderSellerProfileInSimulator();
            updateSimulatorCalculation();
          }
        }
      }
    }
  }

  async function fetchUsersList() {
    if (!state.currentUser || state.currentUser.role !== 'admin') return;
    try {
      const res = await apiRequest('/api/auth/users');
      const users = await res.json();
      state.allUsers = users;

      // Update Metric Counters
      const total = users.length;
      const admins = users.filter(u => u.role === 'admin').length;
      const employees = users.filter(u => u.role === 'employee').length;
      const linked = users.filter(u => u.seller_id).length;

      if (statTotalUsers) statTotalUsers.textContent = total;
      if (statAdminUsers) statAdminUsers.textContent = admins;
      if (statEmployeeUsers) statEmployeeUsers.textContent = employees;
      if (statLinkedSellers) statLinkedSellers.textContent = linked;

      renderUsersTable();
    } catch (e) {
      console.error('Error fetching users:', e);
    }
  }

  function renderUsersTable() {
    if (!usersTableBody) return;

    const searchTerm = (inputSearchUsers ? inputSearchUsers.value.trim().toLowerCase() : '');
    const roleFilter = (selectRoleFilter ? selectRoleFilter.value : 'all');

    const filtered = state.allUsers.filter(u => {
      const matchesSearch = !searchTerm || 
        u.name.toLowerCase().includes(searchTerm) || 
        u.username.toLowerCase().includes(searchTerm) ||
        (u.seller_name && u.seller_name.toLowerCase().includes(searchTerm));
      
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });

    if (filtered.length === 0) {
      usersTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding: 2.5rem; color: var(--text-dim);">
            🔍 Nenhum usuário encontrado com os filtros aplicados.
          </td>
        </tr>
      `;
      return;
    }

    usersTableBody.innerHTML = filtered.map(u => {
      const isSelf = state.currentUser && state.currentUser.id === u.id;
      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:0.65rem;">
              <img src="${u.avatar}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border: 2px solid ${u.role === 'admin' ? 'var(--gold-500)' : 'var(--cyan-500)'};">
              <div>
                <strong style="color: #fff; display:block;">@${u.username}</strong>
                ${isSelf ? '<span style="font-size:0.65rem; color:var(--gold-400); font-weight:700;">● VOCÊ (SESSÃO ATUAL)</span>' : ''}
              </div>
            </div>
          </td>
          <td><span style="font-weight:600;">${u.name}</span></td>
          <td>
            <span class="${u.role === 'admin' ? 'user-badge-admin' : 'user-badge-employee'} user-badge-role">
              ${u.role === 'admin' ? '🛡️ Administrador' : '💼 Funcionário'}
            </span>
          </td>
          <td>
            ${u.seller_name ? `
              <div style="display:flex; align-items:center; gap:0.4rem;">
                <span>👗</span>
                <span>${u.seller_name} <small style="color:var(--gold-400);">(${u.seller_nickname})</small></span>
              </div>
            ` : '<span style="color:var(--text-dim);">Diretoria Geral / Sem vínculo</span>'}
          </td>
          <td>${u.created_at ? u.created_at.substring(0, 10) : '-'}</td>
          <td style="text-align: right;">
            <div class="action-buttons-cell">
              <button class="btn-action btn-action-edit btn-edit-user" data-id="${u.id}" title="Editar informações do colaborador">
                ✏️ Editar
              </button>
              <button class="btn-action btn-action-pwd btn-reset-pwd" data-id="${u.id}" title="Redefinir senha de acesso">
                🔑 Senha
              </button>
              <button class="btn-action btn-action-del btn-del-user" data-id="${u.id}" data-name="${u.name}" data-role="${u.role}" ${isSelf ? 'disabled title="Você não pode excluir a si mesmo"' : 'title="Excluir usuário"'}>
                🗑️ Excluir
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row action listeners
    usersTableBody.querySelectorAll('.btn-edit-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const user = state.allUsers.find(u => u.id === id);
        if (user) openEditUserModal(user);
      });
    });

    usersTableBody.querySelectorAll('.btn-reset-pwd').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const user = state.allUsers.find(u => u.id === id);
        if (user) openResetPwdModal(user);
      });
    });

    usersTableBody.querySelectorAll('.btn-del-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const name = btn.getAttribute('data-name');
        const role = btn.getAttribute('data-role');
        handleDeleteUser(id, name, role);
      });
    });
  }

  function openEditUserModal(user) {
    if (!modalEditUser) return;
    editUserId.value = user.id;
    editUserUsername.value = user.username;
    editUserName.value = user.name;
    editUserRole.value = user.role;
    editUserSellerId.value = user.seller_id || '';
    editUserPassword.value = '';
    document.getElementById('editUserModalTitle').textContent = `Editar Colaborador: ${user.name}`;
    openModal(modalEditUser);
  }

  async function handleEditUserSubmit(e) {
    e.preventDefault();
    const id = Number(editUserId.value);
    const username = editUserUsername.value.trim();
    const name = editUserName.value.trim();
    const role = editUserRole.value;
    const seller_id = editUserSellerId.value ? Number(editUserSellerId.value) : null;
    const password = editUserPassword.value;

    try {
      const res = await apiRequest(`/api/auth/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, role, seller_id, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar usuário');

      closeModal(modalEditUser);
      showToast('Usuário Atualizado!', `Dados de ${name} salvos com sucesso.`, '💾');
      await fetchUsersList();
      await loadDemoUsers();

      // If user edited their own profile, refresh session
      if (state.currentUser && state.currentUser.id === id) {
        state.currentUser.name = name;
        state.currentUser.username = username;
        state.currentUser.role = role;
        state.currentUser.seller_id = seller_id;
        applyRolePermissions();
      }
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  }

  function openResetPwdModal(user) {
    if (!modalResetUserPwd) return;
    resetPwdUserId.value = user.id;
    resetPwdTargetName.textContent = user.name;
    resetPwdTargetUsername.textContent = `@${user.username}`;
    resetPwdNewPassword.value = '';
    openModal(modalResetUserPwd);
  }

  async function handleResetPwdSubmit(e) {
    e.preventDefault();
    const id = Number(resetPwdUserId.value);
    const new_password = resetPwdNewPassword.value;

    try {
      const res = await apiRequest(`/api/auth/users/${id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao redefinir senha');

      closeModal(modalResetUserPwd);
      showToast('Senha Redefinida!', data.message || 'Nova senha definida com sucesso.', '🔑');
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  }

  function generateRandomPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pwd = 'Vestt';
    for (let i = 0; i < 4; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pwd += '@';
    resetPwdNewPassword.value = pwd;
    resetPwdNewPassword.select();
  }

  async function handleDeleteUser(userId, name, role) {
    if (!confirm(`⚠️ Tem certeza de que deseja excluir o acesso do usuário "${name}"?\nEsta ação revogará imediatamente o login e não poderá ser desfeita.`)) {
      return;
    }

    try {
      const res = await apiRequest(`/api/auth/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao excluir usuário');

      showToast('Acesso Removido', `O usuário ${name} foi excluído do sistema.`, '🗑️');
      await fetchUsersList();
      await loadDemoUsers();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  }

  async function handleNewUserSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('newUserUsername').value;
    const password = document.getElementById('newUserPassword').value;
    const name = document.getElementById('newUserName').value;
    const role = document.getElementById('newUserRole').value;
    const seller_id = document.getElementById('newUserSellerId').value ? Number(document.getElementById('newUserSellerId').value) : null;

    try {
      const res = await apiRequest('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name, role, seller_id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar usuário');

      closeModal(modalNewUser);
      formNewUser.reset();
      showToast('Usuário Criado!', `Acesso criado para ${name} com perfil de ${role === 'admin' ? 'Administrador' : 'Funcionário'}.`, '🎉');
      await fetchUsersList();
      await loadDemoUsers();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  }

  // Setup tab switcher
  function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');

        // Security check for Users tab
        if (targetId === 'tab-users') {
          if (!state.currentUser || state.currentUser.role !== 'admin') {
            showToast('Acesso Restrito', 'Apenas administradores podem acessar a Gestão de Usuários.', '🔒');
            return;
          }
        }

        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add('active');
        }

        // Trigger chart resize if navigating to analytics
        if (targetId === 'tab-analytics') {
          setTimeout(() => {
            if (window.chartsManager.historyChart) window.chartsManager.historyChart.resize();
            if (window.chartsManager.categoriesChart) window.chartsManager.categoriesChart.resize();
            if (window.chartsManager.sellersChart) window.chartsManager.sellersChart.resize();
          }, 100);
        }

        // Fetch users if navigating to users tab
        if (targetId === 'tab-users') {
          fetchUsersList();
        }
      });
    });
  }

  // Setup UI event listeners
  function setupEventListeners() {
    periodSelect.addEventListener('change', async (e) => {
      state.currentPeriod = e.target.value;
      await refreshAllData();
    });

    // Login Events
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin(loginUsername.value.trim(), loginPassword.value);
      });
    }

    if (btnTogglePwd) {
      btnTogglePwd.addEventListener('click', () => {
        const isPwd = loginPassword.type === 'password';
        loginPassword.type = isPwd ? 'text' : 'password';
        btnTogglePwd.textContent = isPwd ? '🙈' : '👁️';
      });
    }

    if (btnSwitchUser) {
      btnSwitchUser.addEventListener('click', () => {
        openModal(modalLogin);
      });
    }

    if (btnLogout) {
      btnLogout.addEventListener('click', handleLogout);
    }

    // New User Modal (Admin)
    if (btnOpenNewUserModal) {
      btnOpenNewUserModal.addEventListener('click', () => {
        openModal(modalNewUser);
      });
    }
    if (btnCloseNewUserModal) btnCloseNewUserModal.addEventListener('click', () => closeModal(modalNewUser));
    if (btnCancelNewUser) btnCancelNewUser.addEventListener('click', () => closeModal(modalNewUser));
    if (formNewUser) formNewUser.addEventListener('submit', handleNewUserSubmit);

    // Edit User Modal (Admin)
    if (btnCloseEditUserModal) btnCloseEditUserModal.addEventListener('click', () => closeModal(modalEditUser));
    if (btnCancelEditUser) btnCancelEditUser.addEventListener('click', () => closeModal(modalEditUser));
    if (formEditUser) formEditUser.addEventListener('submit', handleEditUserSubmit);

    // Reset Password Modal (Admin)
    if (btnCloseResetPwdModal) btnCloseResetPwdModal.addEventListener('click', () => closeModal(modalResetUserPwd));
    if (btnCancelResetPwd) btnCancelResetPwd.addEventListener('click', () => closeModal(modalResetUserPwd));
    if (formResetUserPwd) formResetUserPwd.addEventListener('submit', handleResetPwdSubmit);
    if (btnGenRandomPwd) btnGenRandomPwd.addEventListener('click', generateRandomPassword);

    // User Admin Search & Filters
    if (inputSearchUsers) inputSearchUsers.addEventListener('input', renderUsersTable);
    if (selectRoleFilter) selectRoleFilter.addEventListener('change', renderUsersTable);
    if (btnRefreshUsersList) btnRefreshUsersList.addEventListener('click', fetchUsersList);

    // Only My Sales filter
    if (chkOnlyMySales) {
      chkOnlyMySales.addEventListener('change', loadSales);
    }

    // Sale Modal Triggers
    btnOpenNewSaleModal.addEventListener('click', () => {
      openModal(modalNewSale);
      if (state.currentUser && state.currentUser.role === 'employee' && state.currentUser.seller_id) {
        saleSeller.value = state.currentUser.seller_id;
        saleSeller.disabled = true;
      }
      updateSalePreview();
    });
    btnCloseSaleModal.addEventListener('click', () => closeModal(modalNewSale));
    btnCancelSale.addEventListener('click', () => closeModal(modalNewSale));

    saleAmount.addEventListener('input', updateSalePreview);
    saleSeller.addEventListener('change', updateSalePreview);
    saleCategory.addEventListener('change', updateSalePreview);

    formNewSale.addEventListener('submit', handleNewSaleSubmit);

    // Campaign Modal Triggers
    const openCampaignModal = () => openModal(modalNewCampaign);
    btnOpenNewCampaignModal.addEventListener('click', openCampaignModal);
    btnCreateCampaignTab.addEventListener('click', openCampaignModal);
    btnCloseCampaignModal.addEventListener('click', () => closeModal(modalNewCampaign));
    btnCancelCampaign.addEventListener('click', () => closeModal(modalNewCampaign));
    formNewCampaign.addEventListener('submit', handleNewCampaignSubmit);

    // Seller Modal
    btnCloseSellerModal.addEventListener('click', () => closeModal(modalSellerDetails));

    // Simulator
    simulatorSellerSelect.addEventListener('change', (e) => {
      const sellerId = Number(e.target.value);
      state.selectedSellerForSim = state.ranking.find(r => r.id === sellerId);
      renderSellerProfileInSimulator();
      updateSimulatorCalculation();
    });

    simSlider.addEventListener('input', (e) => {
      simSliderVal.textContent = formatCurrency(Number(e.target.value));
      updateSimulatorCalculation();
    });

    // Sales Filters
    document.getElementById('btnApplySalesFilter').addEventListener('click', loadSales);

    // Reset Data
    btnResetSeed.addEventListener('click', async () => {
      if (confirm('Deseja recarregar o banco de dados com 1 ano completo de vendas de moda e vendedores de exemplo?')) {
        try {
          const res = await apiRequest('/api/reset-seed', { method: 'POST' });
          const json = await res.json();
          if (json.success) {
            showToast('Banco Restaurado!', '1 ano de vendas e vendedores gerados com sucesso.', '🌱');
            await refreshAllData();
          }
        } catch (err) {
          alert('Erro ao restaurar dados: ' + err.message);
        }
      }
    });

    // Close modals on outside click
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        // Prevent closing login modal by clicking outside if not logged in
        if (e.target.id === 'modalLogin' && !state.currentUser) {
          return;
        }
        closeModal(e.target);
      }
    });
  }

  function openModal(el) {
    if (el) el.classList.add('show');
  }

  function closeModal(el) {
    if (el) el.classList.remove('show');
  }

  // 2. Fetch Data
  async function loadCategories() {
    try {
      const res = await fetch('/api/categories');
      state.categories = await res.json();

      saleCategory.innerHTML = state.categories.map(c => 
        `<option value="${c.name}">${c.icon} ${c.name}</option>`
      ).join('');

      const filterCategory = document.getElementById('filterCategory');
      filterCategory.innerHTML = `<option value="">Todas as Categorias</option>` +
        state.categories.map(c => `<option value="${c.name}">${c.icon} ${c.name}</option>`).join('');
    } catch (e) {
      console.error('Error loading categories:', e);
    }
  }

  async function loadInitialData() {
    await fetchDashboard();
    populatePeriodSelect();
    await fetchRanking();
    await fetchCampaigns();
    await fetchAnalytics();
    await loadSales();
  }

  async function refreshAllData() {
    await fetchDashboard();
    await fetchRanking();
    await fetchCampaigns();
    await fetchAnalytics();
    await loadSales();
  }

  async function fetchDashboard() {
    try {
      const res = await fetch(`/api/dashboard?period=${state.currentPeriod}`);
      const data = await res.json();
      state.dashboard = data;

      // Update KPIs
      kpiTotalSales.textContent = formatCurrency(data.total_sales);
      kpiSalesCount.textContent = `${data.sales_count} peças e compras`;
      kpiTotalCommission.textContent = formatCurrency(data.total_commission);
      kpiAvgTicket.textContent = formatCurrency(data.avg_ticket);

      if (data.top_seller) {
        kpiTopSeller.textContent = data.top_seller.nickname || data.top_seller.name;
        kpiTopSellerTotal.textContent = `${formatCurrency(data.top_seller.seller_total)} faturados`;
      } else {
        kpiTopSeller.textContent = 'Sem vendas';
        kpiTopSellerTotal.textContent = '-';
      }

      // Update Company Goal (Metômetro)
      const g = data.company_goal;
      const monthNames = {
        '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
        '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
        '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
      };
      const [year, month] = state.currentPeriod.split('-');
      companyGoalPeriodText.textContent = `Desempenho Corporativo de Vendas (${monthNames[month] || month}/${year})`;

      companyCurrentSales.textContent = formatCurrency(data.total_sales);
      companyTargetSales.textContent = formatCurrency(g.target);
      companyPercentBadge.textContent = `${g.percent}%`;

      const barWidth = Math.min(100, (g.percent / 125) * 100);
      companyProgressFill.style.width = `${barWidth}%`;

      if (g.is_super_reached) {
        companyGoalFooterStatus.innerHTML = `🚀 <strong style="color:#f43f5e">INCRÍVEL! A SUPER META FOI BATIDA!</strong> Bônus multiplicador de +25% ativado para todos os consultores!`;
      } else if (g.is_reached) {
        companyGoalFooterStatus.innerHTML = `🎉 <strong style="color:#10b981">PARABÉNS! META DA LOJA CONQUISTADA!</strong> Faltam apenas ${formatCurrency(g.remaining_to_super)} para desbloquear a Super Meta!`;
      } else {
        companyGoalFooterStatus.innerHTML = `⚡ Faltam <strong>${formatCurrency(g.remaining_to_goal)}</strong> para a loja bater a meta do mês e garantir a bonificação coletiva.`;
      }

      // Active Campaign Ribbon
      if (data.active_campaigns && data.active_campaigns.length > 0) {
        const activeCamp = data.active_campaigns[0];
        campaignBanner.style.display = 'flex';
        ribbonTitle.textContent = `${activeCamp.icon} ${activeCamp.title}`;
        ribbonDesc.textContent = `${activeCamp.description} (Alvo: ${activeCamp.category_target})`;
        ribbonBadge.textContent = `+${activeCamp.bonus_rate.toFixed(1)}% BÔNUS`;
      } else {
        campaignBanner.style.display = 'none';
      }

    } catch (e) {
      console.error('Error fetching dashboard:', e);
    }
  }

  function populatePeriodSelect() {
    if (!state.dashboard || !state.dashboard.available_periods) return;

    const periods = state.dashboard.available_periods;
    const monthNames = {
      '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
      '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
      '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
    };

    periodSelect.innerHTML = periods.map(p => {
      const [y, m] = p.split('-');
      const label = `${monthNames[m] || m} de ${y}`;
      return `<option value="${p}" ${p === state.currentPeriod ? 'selected' : ''}>${label}</option>`;
    }).join('');
  }

  async function fetchRanking() {
    try {
      const res = await fetch(`/api/ranking?period=${state.currentPeriod}`);
      const data = await res.json();
      state.ranking = data.ranking;

      renderPodium(data.ranking);
      renderRankingTable(data.ranking);
      populateSellerDropdowns(data.ranking);

      // Simulator sync
      if (!state.selectedSellerForSim && data.ranking.length > 0) {
        state.selectedSellerForSim = data.ranking[0];
      } else if (state.selectedSellerForSim) {
        state.selectedSellerForSim = data.ranking.find(r => r.id === state.selectedSellerForSim.id) || data.ranking[0];
      }
      renderSellerProfileInSimulator();
      updateSimulatorCalculation();

      // Update Chart in Analytics tab
      window.chartsManager.renderSellersChart(data.ranking);
    } catch (e) {
      console.error('Error fetching ranking:', e);
    }
  }

  // 3. Render Podium Gamificado
  function renderPodium(ranking) {
    if (!ranking || ranking.length < 3) {
      podiumStage.innerHTML = '<p class="text-muted">Dados insuficientes para formar o pódio.</p>';
      return;
    }

    const first = ranking[0];
    const second = ranking[1];
    const third = ranking[2];

    podiumStage.innerHTML = `
      <!-- 2º LUGAR (PRATA) -->
      <div class="podium-col podium-silver">
        <div class="podium-avatar-wrapper">
          <img src="${second.avatar}" alt="${second.name}" class="podium-avatar">
          <div class="podium-medal">🥈</div>
        </div>
        <div class="podium-pedestal glass-panel">
          <div>
            <div class="podium-seller-name">${second.name}</div>
            <div class="podium-nickname">${second.nickname}</div>
            <div class="podium-sales-amount">${formatCurrency(second.total_sales)}</div>
            <div class="podium-commission">Comissão: ${formatCurrency(second.total_commission)}</div>
          </div>
          <div class="podium-meta-progress">
            <div class="podium-mini-bar">
              <div class="podium-mini-bar-fill" style="width: ${Math.min(100, second.goal.percent)}%; background: #94a3b8;"></div>
            </div>
            <div class="podium-mini-bar-text">${second.goal.percent}% da meta</div>
            <div class="podium-challenge-tag">Faltam ${formatCurrency(second.diff_to_next)} para o 1º!</div>
          </div>
        </div>
      </div>

      <!-- 1º LUGAR (OURO) -->
      <div class="podium-col podium-gold">
        <div class="podium-avatar-wrapper">
          <div class="podium-crown">👑</div>
          <img src="${first.avatar}" alt="${first.name}" class="podium-avatar">
          <div class="podium-medal">🥇</div>
        </div>
        <div class="podium-pedestal glass-panel">
          <div>
            <div class="podium-seller-name">${first.name}</div>
            <div class="podium-nickname" style="color: #fbbf24;">${first.nickname}</div>
            <div class="podium-sales-amount" style="color: #fbbf24;">${formatCurrency(first.total_sales)}</div>
            <div class="podium-commission">Comissão: ${formatCurrency(first.total_commission)}</div>
          </div>
          <div class="podium-meta-progress">
            <div class="podium-mini-bar">
              <div class="podium-mini-bar-fill" style="width: ${Math.min(100, first.goal.percent)}%; background: #fbbf24;"></div>
            </div>
            <div class="podium-mini-bar-text" style="color: #fbbf24; font-weight:700;">${first.goal.percent}% da meta (Líder Supremo)</div>
            <div class="podium-challenge-tag" style="border-color: rgba(245, 158, 11, 0.4); color: #fbbf24;">🔥 Invicta no Topo da Moda</div>
          </div>
        </div>
      </div>

      <!-- 3º LUGAR (BRONZE) -->
      <div class="podium-col podium-bronze">
        <div class="podium-avatar-wrapper">
          <img src="${third.avatar}" alt="${third.name}" class="podium-avatar">
          <div class="podium-medal">🥉</div>
        </div>
        <div class="podium-pedestal glass-panel">
          <div>
            <div class="podium-seller-name">${third.name}</div>
            <div class="podium-nickname">${third.nickname}</div>
            <div class="podium-sales-amount">${formatCurrency(third.total_sales)}</div>
            <div class="podium-commission">Comissão: ${formatCurrency(third.total_commission)}</div>
          </div>
          <div class="podium-meta-progress">
            <div class="podium-mini-bar">
              <div class="podium-mini-bar-fill" style="width: ${Math.min(100, third.goal.percent)}%; background: #d97706;"></div>
            </div>
            <div class="podium-mini-bar-text">${third.goal.percent}% da meta</div>
            <div class="podium-challenge-tag">Faltam ${formatCurrency(third.diff_to_next)} para o 2º!</div>
          </div>
        </div>
      </div>
    `;
  }

  // 4. Render Complete Ranking Table
  function renderRankingTable(ranking) {
    rankingTableBody.innerHTML = ranking.map(seller => {
      let posClass = 'rank-position-pill';
      if (seller.position === 1) posClass += ' pos-1';
      else if (seller.position === 2) posClass += ' pos-2';
      else if (seller.position === 3) posClass += ' pos-3';

      const badgesHtml = seller.badges.map(b => 
        `<span class="badge-chip" style="background: ${b.color}20; color: ${b.color}; border: 1px solid ${b.color}40;">${b.icon} ${b.label}</span>`
      ).join('');

      return `
        <tr>
          <td><div class="${posClass}">${seller.position}º</div></td>
          <td>
            <div class="seller-cell">
              <img src="${seller.avatar}" class="seller-table-avatar" alt="${seller.name}">
              <div class="seller-names">
                <span class="seller-primary-name">${seller.name}</span>
                <span class="seller-sub-nickname">${seller.nickname}</span>
              </div>
            </div>
          </td>
          <td><span class="level-tag">${seller.level}</span></td>
          <td><strong style="color: #fff;">${formatCurrency(seller.total_sales)}</strong></td>
          <td>${formatCurrency(seller.goal.target)}</td>
          <td>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <div style="flex:1; height:6px; background:rgba(255,255,255,0.1); border-radius:99px; overflow:hidden;">
                <div style="width:${Math.min(100, seller.goal.percent)}%; height:100%; background:${seller.goal.is_reached ? '#10b981' : '#f59e0b'};"></div>
              </div>
              <span style="font-size:0.8rem; font-weight:700; color:${seller.goal.is_reached ? '#10b981' : '#f59e0b'};">${seller.goal.percent}%</span>
            </div>
          </td>
          <td><strong class="text-emerald">${formatCurrency(seller.total_commission)}</strong></td>
          <td><div class="badge-chips">${badgesHtml}</div></td>
          <td>
            <button class="btn btn-glass btn-sm view-seller-btn" data-id="${seller.id}">
              Raio-X
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach click handlers to view seller details
    document.querySelectorAll('.view-seller-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.getAttribute('data-id'));
        openSellerModal(id);
      });
    });
  }

  function populateSellerDropdowns(ranking) {
    saleSeller.innerHTML = ranking.map(r => 
      `<option value="${r.id}">${r.name} (${r.nickname})</option>`
    ).join('');

    simulatorSellerSelect.innerHTML = ranking.map(r => 
      `<option value="${r.id}" ${state.selectedSellerForSim && state.selectedSellerForSim.id === r.id ? 'selected' : ''}>${r.name} (${r.nickname})</option>`
    ).join('');

    const filterSeller = document.getElementById('filterSeller');
    filterSeller.innerHTML = `<option value="">Todos os Vendedores</option>` +
      ranking.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

    if (newUserSellerId) {
      newUserSellerId.innerHTML = `<option value="">Nenhum vínculo (Geral / Diretoria)</option>` +
        ranking.map(r => `<option value="${r.id}">${r.name} (${r.nickname})</option>`).join('');
    }

    if (editUserSellerId) {
      editUserSellerId.innerHTML = `<option value="">Nenhum vínculo (Geral / Diretoria)</option>` +
        ranking.map(r => `<option value="${r.id}">${r.name} (${r.nickname})</option>`).join('');
    }

    // If logged in as employee, lock to current seller
    if (state.currentUser && state.currentUser.role === 'employee' && state.currentUser.seller_id) {
      saleSeller.value = state.currentUser.seller_id;
      saleSeller.disabled = true;
    }
  }

  // 5. Seller Profile in Simulator Tab
  function renderSellerProfileInSimulator() {
    const s = state.selectedSellerForSim;
    if (!s) return;

    sellerProfileArea.innerHTML = `
      <div class="profile-card-top">
        <img src="${s.avatar}" class="profile-avatar-big" alt="${s.name}">
        <div>
          <h3 style="color:#fff; font-size:1.3rem;">${s.name}</h3>
          <div style="color:var(--gold-400); font-size:0.85rem; font-weight:600;">${s.nickname}</div>
          <span class="level-tag" style="margin-top:0.35rem;">${s.level}</span>
        </div>
      </div>

      <div class="profile-stat-grid">
        <div class="profile-stat-box">
          <div class="lbl">Vendas no Mês</div>
          <div class="val highlight-gold">${formatCurrency(s.total_sales)}</div>
        </div>
        <div class="profile-stat-box">
          <div class="lbl">Comissão Acumulada</div>
          <div class="val text-emerald">${formatCurrency(s.total_commission)}</div>
        </div>
        <div class="profile-stat-box">
          <div class="lbl">Meta do Consultor</div>
          <div class="val">${formatCurrency(s.goal.target)}</div>
        </div>
        <div class="profile-stat-box">
          <div class="lbl">Posição no Ranking</div>
          <div class="val" style="color:#fbbf24;">${s.position}º Lugar</div>
        </div>
      </div>
    `;
  }

  // 6. Interactive Next-Sale Simulator Calculation
  function updateSimulatorCalculation() {
    const s = state.selectedSellerForSim;
    if (!s) return;

    const extraSales = Number(simSlider.value);

    // Active campaign bonus if any
    let activeBonus = 0;
    if (state.dashboard && state.dashboard.active_campaigns && state.dashboard.active_campaigns.length > 0) {
      activeBonus = state.dashboard.active_campaigns[0].bonus_rate || 0;
    }

    const totalRate = s.base_commission_rate + activeBonus;
    const extraCommission = extraSales * (totalRate / 100);
    const newTotalSales = s.total_sales + extraSales;
    const newPercent = Math.round((newTotalSales / s.goal.target) * 1000) / 10;

    simExtraCommission.textContent = `+ ${formatCurrency(extraCommission)}`;
    simRateNote.textContent = `Taxa base ${s.base_commission_rate}% + Campanha ${activeBonus}% = ${totalRate}%`;
    simNewTotal.textContent = formatCurrency(newTotalSales);
    simNewPercent.textContent = `${newPercent}% da Meta`;

    // Simulated new rank forecast
    const simulatedRanking = [...state.ranking];
    const targetIdx = simulatedRanking.findIndex(r => r.id === s.id);
    if (targetIdx !== -1) {
      simulatedRanking[targetIdx] = { ...simulatedRanking[targetIdx], total_sales: newTotalSales };
    }
    simulatedRanking.sort((a, b) => b.total_sales - a.total_sales);
    const newPos = simulatedRanking.findIndex(r => r.id === s.id) + 1;

    if (newPos === 1) {
      simRankForecast.innerHTML = '🥇 1º Lugar (LÍDER!)';
      simRankDiff.textContent = 'Você assume a liderança geral da loja!';
      simMotivationText.innerHTML = `👑 <strong>UAU!</strong> Com mais esta venda simulada de ${formatCurrency(extraSales)}, você ultrapassa o primeiro colocado e vira o Rei/Rainha da loja!`;
    } else if (newPos < s.position) {
      simRankForecast.innerHTML = `🚀 ${newPos}º Lugar (Subindo!)`;
      const ahead = simulatedRanking[newPos - 2];
      const diff = ahead ? Math.round((ahead.total_sales - newTotalSales) * 100) / 100 : 0;
      simRankDiff.textContent = `Faltam ${formatCurrency(diff)} para alcançar ${ahead ? ahead.nickname : ''}!`;
      simMotivationText.innerHTML = `⚡ <strong>Sensacional!</strong> Você sobe de ${s.position}º para ${newPos}º colocado! Apenas mais algumas vendas para o topo!`;
    } else {
      simRankForecast.innerHTML = `${s.position}º Lugar`;
      const ahead = simulatedRanking[s.position - 2];
      const diff = ahead ? Math.round((ahead.total_sales - newTotalSales) * 100) / 100 : 0;
      simRankDiff.textContent = diff > 0 ? `Faltam ${formatCurrency(diff)} para o ${s.position - 1}º!` : 'Manutenção de posição';
      simMotivationText.innerHTML = `🎯 Continue no ritmo! Você garante mais <strong>${formatCurrency(extraCommission)}</strong> de comissão no seu bolso este mês.`;
    }
  }

  // 7. Live Calculation for New Sale Modal
  function updateSalePreview() {
    const sellerId = Number(saleSeller.value);
    const category = saleCategory.value;
    const amount = Number(saleAmount.value) || 0;

    const seller = state.ranking.find(r => r.id === sellerId);
    const baseRate = seller ? seller.base_commission_rate : 4.0;

    // Check active campaign
    let bonusRate = 0;
    if (state.dashboard && state.dashboard.active_campaigns) {
      const camp = state.dashboard.active_campaigns.find(c => c.category_target === 'TODAS' || c.category_target === category);
      if (camp) {
        bonusRate = camp.bonus_rate;
      }
    }

    const totalRate = Math.round((baseRate + bonusRate) * 10) / 10;
    const commission = Math.round((amount * (totalRate / 100)) * 100) / 100;

    previewBaseRate.textContent = `${baseRate.toFixed(1)}%`;
    if (bonusRate > 0) {
      previewBonusRate.textContent = `+${bonusRate.toFixed(1)}% (Campanha Sazonal!)`;
      previewBonusRate.style.display = 'block';
    } else {
      previewBonusRate.textContent = '+0.0% (Nenhuma campanha específica)';
    }

    previewCommissionTotal.textContent = `${formatCurrency(commission)} (${totalRate}%)`;
  }

  // 8. Handle New Sale Submit
  async function handleNewSaleSubmit(e) {
    e.preventDefault();

    let sellerId = Number(saleSeller.value);
    if (state.currentUser && state.currentUser.role === 'employee' && state.currentUser.seller_id) {
      sellerId = state.currentUser.seller_id;
    }

    const category = saleCategory.value;
    const customer = document.getElementById('saleCustomer').value;
    const payment = document.getElementById('salePayment').value;
    const amount = Number(saleAmount.value);
    const itemsCount = Number(document.getElementById('saleItemsCount').value) || 1;

    try {
      const res = await apiRequest('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: sellerId,
          customer_name: customer,
          category,
          total_amount: amount,
          payment_method: payment,
          items_count: itemsCount
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao registrar venda.');

      closeModal(modalNewSale);
      formNewSale.reset();
      document.getElementById('saleCustomer').value = 'Cliente VIP';
      document.getElementById('saleItemsCount').value = '1';

      // Gamification reaction!
      if (data.just_hit_goal) {
        sfx.playGoalVictory();
        triggerConfetti('super');
        showToast('🎯 META BATIDA!', `${data.seller_name} acabou de bater 100% da sua meta mensal! Parabéns!`, '🚀');
      } else {
        sfx.playSuccess();
        triggerConfetti('normal');
        showToast('Venda Lançada com Sucesso!', `Comissão de ${formatCurrency(data.commission_amount)} garantida para ${data.seller_name}!`, '👗');
      }

      await refreshAllData();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  }

  // 9. Campaigns Management
  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/campaigns');
      state.campaigns = await res.json();
      renderCampaigns(state.campaigns);
    } catch (e) {
      console.error('Error fetching campaigns:', e);
    }
  }

  function renderCampaigns(campaigns) {
    const isAdmin = state.currentUser && state.currentUser.role === 'admin';

    campaignsGrid.innerHTML = campaigns.map(c => `
      <div class="campaign-card glass-panel" style="border-left: 4px solid ${c.color};">
        <span class="camp-active-badge ${c.is_active ? 'camp-status-on' : 'camp-status-off'}">
          ${c.is_active ? '● ATIVA AGORA' : 'ENCERRADA'}
        </span>
        <div>
          <div class="camp-icon">${c.icon}</div>
          <h3 class="camp-title">${c.title}</h3>
          <p class="camp-desc">${c.description}</p>
        </div>
        <div>
          <div class="camp-meta-row">
            <span>Período: ${c.start_date.split('-').reverse().join('/')} a ${c.end_date.split('-').reverse().join('/')}</span>
            <span>Alvo: <strong>${c.category_target}</strong></span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <div>
              <div style="font-size:0.75rem; color:var(--text-muted);">BÔNUS EXTRA</div>
              <div class="camp-bonus-highlight">+${c.bonus_rate.toFixed(1)}% Comissão</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.75rem; color:var(--text-muted);">VENDAS GERADAS</div>
              <div style="font-weight:700; color:#fff;">${formatCurrency(c.total_sales)}</div>
            </div>
          </div>
          ${isAdmin ? `
            <button class="btn btn-glass btn-sm toggle-camp-btn" data-id="${c.id}" style="width:100%; justify-content:center;">
              ${c.is_active ? '⏸️ Pausar Campanha' : '▶️ Reativar Campanha'}
            </button>
          ` : `
            <div style="font-size:0.72rem; color:var(--text-dim); text-align:center; padding:0.4rem;">
              🔒 Apenas administradores podem ativar ou pausar campanhas
            </div>
          `}
        </div>
      </div>
    `).join('');

    if (isAdmin) {
      document.querySelectorAll('.toggle-camp-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          await toggleCampaign(id);
        });
      });
    }
  }

  async function toggleCampaign(id) {
    try {
      const res = await apiRequest(`/api/campaigns/${id}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok) {
        showToast('Campanha Atualizada', 'Status alterado com sucesso.', '✨');
        await refreshAllData();
      } else {
        alert(data.error || 'Erro ao alterar campanha.');
      }
    } catch (e) {
      alert('Erro ao alterar campanha: ' + e.message);
    }
  }

  async function handleNewCampaignSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('campTitle').value;
    const desc = document.getElementById('campDesc').value;
    const start = document.getElementById('campStart').value;
    const end = document.getElementById('campEnd').value;
    const bonus = Number(document.getElementById('campBonus').value);
    const cat = document.getElementById('campCategory').value;
    const color = document.getElementById('campColor').value;
    const icon = document.getElementById('campIcon').value;

    try {
      const res = await apiRequest('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: desc,
          start_date: start,
          end_date: end,
          bonus_rate: bonus,
          category_target: cat,
          color,
          icon
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao criar campanha');

      closeModal(modalNewCampaign);
      formNewCampaign.reset();
      showToast('Nova Campanha Criada!', `Campanha "${title}" ativada com sucesso!`, icon);
      await refreshAllData();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  }

  // 10. Analytics Data & Charts
  async function fetchAnalytics() {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      window.chartsManager.renderHistoryChart(data.monthly_history);
      window.chartsManager.renderCategoriesChart(data.categories);
    } catch (e) {
      console.error('Error fetching analytics:', e);
    }
  }

  // 11. Sales Feed
  async function loadSales() {
    let sellerId = document.getElementById('filterSeller').value;
    const category = document.getElementById('filterCategory').value;

    // Filter only my sales if employee checked
    if (chkOnlyMySales && chkOnlyMySales.checked && state.currentUser && state.currentUser.seller_id) {
      sellerId = state.currentUser.seller_id;
    }

    let url = `/api/sales?period=${state.currentPeriod}&limit=35`;
    if (sellerId) url += `&seller_id=${sellerId}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;

    try {
      const res = await fetch(url);
      const sales = await res.json();

      salesTableBody.innerHTML = sales.map(s => `
        <tr>
          <td><span style="font-family:monospace; color:var(--gold-400);">${s.code}</span></td>
          <td>${s.sale_date.substring(0, 16)}</td>
          <td>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <img src="${s.seller_avatar}" style="width:28px; height:28px; border-radius:50%; object-fit:cover;">
              <span>${s.seller_nickname}</span>
            </div>
          </td>
          <td>${s.customer_name}</td>
          <td>${s.category}</td>
          <td>${s.items_count}</td>
          <td><strong>${formatCurrency(s.total_amount)}</strong></td>
          <td>${s.total_commission_rate}%</td>
          <td><strong class="text-emerald">${formatCurrency(s.commission_amount)}</strong></td>
          <td>${s.campaign_bonus_rate > 0 ? `<span class="badge-chip" style="background:#ec489925; color:#f472b6;">✨ +${s.campaign_bonus_rate}%</span>` : '-'}</td>
        </tr>
      `).join('');
    } catch (e) {
      console.error('Error loading sales:', e);
    }
  }

  // 12. Seller Details Modal (Raio-X)
  async function openSellerModal(sellerId) {
    try {
      const res = await fetch(`/api/sellers/${sellerId}?period=${state.currentPeriod}`);
      const data = await res.json();

      modalSellerName.textContent = `Raio-X: ${data.seller.name} (${data.seller.nickname})`;

      const catsHtml = data.categories_breakdown.map(c => `
        <div style="display:flex; justify-content:space-between; padding:0.4rem 0; border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.85rem;">
          <span>${c.category} (${c.count} vendas)</span>
          <strong>${formatCurrency(c.total)}</strong>
        </div>
      `).join('');

      const recentSalesHtml = data.recent_sales.map(s => `
        <div style="display:flex; justify-content:space-between; padding:0.4rem 0; border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.82rem;">
          <span>${s.sale_date.substring(5, 10)} - ${s.category}</span>
          <span class="text-emerald">${formatCurrency(s.commission_amount)}</span>
        </div>
      `).join('');

      modalSellerBody.innerHTML = `
        <div style="display:flex; align-items:center; gap:1.2rem; margin-bottom:1.5rem;">
          <img src="${data.seller.avatar}" style="width:72px; height:72px; border-radius:50%; object-fit:cover; border:3px solid var(--gold-400);">
          <div>
            <h4 style="font-size:1.25rem; color:#fff;">${data.seller.name}</h4>
            <div style="color:var(--gold-400); font-size:0.85rem; font-weight:600;">${data.seller.nickname}</div>
            <div style="color:var(--text-muted); font-size:0.8rem;">Admissão: ${data.seller.hire_date} • Taxa Base: ${data.seller.base_commission_rate}%</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:1rem; margin-bottom:1.5rem;">
          <div style="background:rgba(0,0,0,0.3); padding:0.9rem; border-radius:12px; border:1px solid var(--border-glass);">
            <div style="font-size:0.75rem; color:var(--text-muted);">VENDAS NO MÊS</div>
            <div style="font-size:1.2rem; font-weight:800; color:#fff;">${formatCurrency(data.total_sales)}</div>
          </div>
          <div style="background:rgba(0,0,0,0.3); padding:0.9rem; border-radius:12px; border:1px solid var(--border-glass);">
            <div style="font-size:0.75rem; color:var(--text-muted);">COMISSÃO GANHA</div>
            <div style="font-size:1.2rem; font-weight:800; color:#10b981;">${formatCurrency(data.total_commission)}</div>
          </div>
          <div style="background:rgba(0,0,0,0.3); padding:0.9rem; border-radius:12px; border:1px solid var(--border-glass);">
            <div style="font-size:0.75rem; color:var(--text-muted);">META PESSOAL</div>
            <div style="font-size:1.2rem; font-weight:800; color:#fbbf24;">${data.goal.percent}%</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
          <div>
            <h5 style="color:#fff; margin-bottom:0.75rem; font-family:var(--font-serif);">👗 Mix de Peças Mais Vendidas</h5>
            ${catsHtml || '<p style="color:var(--text-muted)">Nenhuma venda ainda.</p>'}
          </div>
          <div>
            <h5 style="color:#fff; margin-bottom:0.75rem; font-family:var(--font-serif);">⚡ Últimas Comissões Creditadas</h5>
            ${recentSalesHtml || '<p style="color:var(--text-muted)">Sem registros recentes.</p>'}
          </div>
        </div>
      `;

      openModal(modalSellerDetails);
    } catch (e) {
      alert('Erro ao carregar detalhes do vendedor: ' + e.message);
    }
  }

  // Start app
  init();
});
