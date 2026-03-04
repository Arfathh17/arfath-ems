/* ============================================================
   EMS — Dashboard Script (CLEAN VERSION)
   ============================================================ */

"use strict";

/* ── Avatar colours ── */
const AVATAR_COLORS = ["#6366F1","#10B981","#F59E0B","#EF4444","#8B5CF6","#06B6D4","#EC4899","#14B8A6"];
const AVATAR_BG     = ["#6366F1","#10B981","#F59E0B","#EF4444","#8B5CF6","#06B6D4","#EC4899","#14B8A6"];

/* ── Stat bar animation on load ── */
window.addEventListener("DOMContentLoaded", () => {
  const total  = window.EMS_TOTAL  || 0;
  const active = window.EMS_ACTIVE || 0;
  const leave  = window.EMS_LEAVE  || 0;

  setTimeout(() => {
    const barActive = document.getElementById("bar-active");
    const barLeave  = document.getElementById("bar-leave");
    if (barActive) barActive.style.width = total > 0 ? (active / total * 100) + "%" : "0%";
    if (barLeave)  barLeave.style.width  = total > 0 ? (leave  / total * 100) + "%" : "0%";
  }, 200);

  document.querySelectorAll(".trow").forEach((row, i) => {
    row.style.opacity   = "0";
    row.style.transform = "translateY(10px)";
    setTimeout(() => {
      row.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      row.style.opacity    = "1";
      row.style.transform  = "none";
    }, 60 + i * 40);
  });
});

/* ══════════════════════════════════════════════
   SIDEBAR + VIEW NAVIGATION
══════════════════════════════════════════════ */

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

function switchView(viewId, linkEl) {
  document.querySelectorAll(".view-section").forEach(s => s.classList.add("hidden"));
  document.querySelectorAll(".sb-item").forEach(l => l.classList.remove("active"));

  const target = document.getElementById("view-" + viewId);
  if (target) {
    target.classList.remove("hidden");
    target.style.animation = "none";
    void target.offsetHeight;
    target.style.animation = "";
  }
  if (linkEl) linkEl.classList.add("active");
  document.getElementById("sidebar").classList.remove("open");
  return false;
}

/* ══════════════════════════════════════════════
   SEARCH + FILTER
══════════════════════════════════════════════ */

function searchEmployees(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll(".emp-row").forEach(row => {
    const name = (row.dataset.name   || "").toLowerCase();
    const dept = (row.dataset.dept   || "").toLowerCase();
    const stat = (row.dataset.status || "").toLowerCase();
    row.style.display = (!q || name.includes(q) || dept.includes(q) || stat.includes(q)) ? "" : "none";
  });
}

function filterEmployees() {
  const deptVal   = document.getElementById("dept-filter").value.toLowerCase();
  const statusVal = document.getElementById("status-filter").value.toLowerCase();
  document.querySelectorAll(".emp-row").forEach(row => {
    const dept   = (row.dataset.dept   || "").toLowerCase();
    const status = (row.dataset.status || "").toLowerCase();
    const show   = (!deptVal || dept === deptVal) && (!statusVal || status === statusVal);
    row.style.display = show ? "" : "none";
  });
}

function toggleSelectAll(masterCheckbox) {
  document.querySelectorAll(".row-check").forEach(cb => {
    cb.checked = masterCheckbox.checked;
  });
}

/* ══════════════════════════════════════════════
   MODAL — Add / Edit Employee
══════════════════════════════════════════════ */

const modalBackdrop = document.getElementById("modal-backdrop");
const modalTitle    = document.getElementById("modal-title");
const modalSub      = document.getElementById("modal-sub");
const formSubmitBtn = document.getElementById("form-submit-btn");
const submitLabel   = document.getElementById("submit-label");
const editIdInput   = document.getElementById("edit-id");
const formError     = document.getElementById("form-error");
const formErrorMsg  = document.getElementById("form-error-msg");

function openAddModal() {
  resetForm();
  modalTitle.textContent  = "Add New Employee";
  modalSub.textContent    = "Fill in the details to onboard a new team member";
  submitLabel.textContent = "Save Employee";
  editIdInput.value       = "";
  showModal();
}

async function openEditModal(empId) {
  resetForm();
  modalTitle.textContent  = "Edit Employee";
  modalSub.textContent    = "Update the employee's information below";
  submitLabel.textContent = "Update Employee";

  try {
    const res = await fetch(`/api/employees/${empId}`);
    if (!res.ok) { showToast("Failed to load employee data.", "error"); return; }
    const emp = await res.json();

    document.getElementById("edit-id").value   = emp.id;
    document.getElementById("f-name").value    = emp.name;
    document.getElementById("f-email").value   = emp.email;
    document.getElementById("f-dept").value    = emp.department;
    document.getElementById("f-status").value  = emp.status;
    document.getElementById("f-phone").value   = emp.phone           || "";
    document.getElementById("f-address").value = emp.address         || "";
    document.getElementById("f-doj").value     = emp.date_of_joining || "";
    document.getElementById("f-salary").value  = emp.salary          || "";

    showModal();
  } catch (err) {
    showToast("Network error loading employee.", "error");
  }
}

function showModal() {
  modalBackdrop.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  const box = document.getElementById("modal-box");
  box.style.animation = "none";
  void box.offsetHeight;
  box.style.animation = "";
  setTimeout(() => document.getElementById("f-name").focus(), 100);
}

function closeModal() {
  modalBackdrop.classList.add("hidden");
  document.body.style.overflow = "";
  resetForm();
}

function resetForm() {
  document.getElementById("emp-form").reset();
  document.getElementById("edit-id").value   = "";
  document.getElementById("f-phone").value   = "";
  document.getElementById("f-address").value = "";
  document.getElementById("f-doj").value     = "";
  document.getElementById("f-salary").value  = "";
  const preview = document.getElementById("photo-preview");
  if (preview) {
    preview.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
  }
  formError.classList.add("hidden");
}

modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

/* ══════════════════════════════════════════════
   FORM SUBMIT — Create or Update
══════════════════════════════════════════════ */

async function submitForm(e) {
  e.preventDefault();
  formError.classList.add("hidden");

  const id     = document.getElementById("edit-id").value;
  const isEdit = !!id;
  const url    = isEdit ? `/api/employees/${id}` : "/api/employees";
  const method = isEdit ? "PUT" : "POST";

  const formData = new FormData();
  formData.append("name",            document.getElementById("f-name").value.trim());
  formData.append("email",           document.getElementById("f-email").value.trim());
  formData.append("department",      document.getElementById("f-dept").value);
  formData.append("status",          document.getElementById("f-status").value);
  formData.append("phone",           document.getElementById("f-phone").value.trim());
  formData.append("address",         document.getElementById("f-address").value.trim());
  formData.append("date_of_joining", document.getElementById("f-doj").value);
  formData.append("salary",          document.getElementById("f-salary").value.trim());

  const photoInput = document.getElementById("f-photo");
  if (photoInput && photoInput.files[0]) {
    formData.append("photo", photoInput.files[0]);
  }

  formSubmitBtn.disabled  = true;
  submitLabel.textContent = isEdit ? "Updating…" : "Saving…";

  try {
    const res  = await fetch(url, { method, body: formData });
    const data = await res.json();

    if (!res.ok) {
      formErrorMsg.textContent = data.error || "Something went wrong.";
      formError.classList.remove("hidden");
      formSubmitBtn.disabled  = false;
      submitLabel.textContent = isEdit ? "Update Employee" : "Save Employee";
      return;
    }

    closeModal();
    showToast(
      isEdit ? `✅ ${data.name} updated successfully!` : `🎉 ${data.name} added to the team!`,
      "success"
    );
    setTimeout(() => location.reload(), 600);

  } catch (err) {
    formErrorMsg.textContent = "Network error. Please try again.";
    formError.classList.remove("hidden");
    formSubmitBtn.disabled  = false;
    submitLabel.textContent = isEdit ? "Update Employee" : "Save Employee";
  }
}

/* ══════════════════════════════════════════════
   DELETE EMPLOYEE
══════════════════════════════════════════════ */

let _pendingDeleteId  = null;
let _pendingDeleteRow = null;

const confirmBackdrop = document.getElementById("confirm-backdrop");
const confirmYesBtn   = document.getElementById("confirm-yes");
const confirmMsgEl    = document.getElementById("confirm-msg");

function deleteEmployee(empId, btnEl) {
  const row  = btnEl.closest(".trow");
  const name = row ? row.querySelector(".emp-name")?.textContent : "this employee";
  _pendingDeleteId  = empId;
  _pendingDeleteRow = row;
  confirmMsgEl.textContent = `This will permanently delete ${name} from the system. This cannot be undone.`;
  confirmBackdrop.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeConfirm() {
  confirmBackdrop.classList.add("hidden");
  document.body.style.overflow = "";
  _pendingDeleteId  = null;
  _pendingDeleteRow = null;
}

confirmBackdrop.addEventListener("click", (e) => {
  if (e.target === confirmBackdrop) closeConfirm();
});

confirmYesBtn.addEventListener("click", async () => {
  if (!_pendingDeleteId) return;
  confirmYesBtn.textContent = "Deleting…";
  confirmYesBtn.disabled    = true;

  try {
    const res = await fetch(`/api/employees/${_pendingDeleteId}`, { method: "DELETE" });
    if (res.ok) {
      if (_pendingDeleteRow) {
        _pendingDeleteRow.style.transition = "all 0.35s ease";
        _pendingDeleteRow.style.opacity    = "0";
        _pendingDeleteRow.style.transform  = "translateX(20px)";
        setTimeout(() => {
          _pendingDeleteRow.remove();
          updateCountBadge(-1);
        }, 350);
      }
      showToast("🗑️ Employee deleted.", "error");
    } else {
      showToast("Failed to delete employee.", "error");
    }
  } catch (err) {
    showToast("Network error.", "error");
  }

  confirmYesBtn.textContent = "Delete";
  confirmYesBtn.disabled    = false;
  closeConfirm();
});

function updateCountBadge(delta) {
  const badge = document.getElementById("sb-emp-count");
  if (badge) {
    badge.textContent = Math.max(0, (parseInt(badge.textContent) || 0) + delta);
  }
}

/* ══════════════════════════════════════════════
   TOAST NOTIFICATIONS
══════════════════════════════════════════════ */

function showToast(message, type = "info", duration = 4000) {
  const container = document.getElementById("toast-container");
  const icons     = { success: "✅", error: "❌", info: "ℹ️" };
  const toast     = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || "📢"}</span><span>${message}</span>`;
  toast.addEventListener("click", () => dismissToast(toast));
  container.appendChild(toast);
  setTimeout(() => dismissToast(toast), duration);
}

function dismissToast(toastEl) {
  toastEl.style.animation = "toastOut 0.35s ease forwards";
  setTimeout(() => toastEl.remove(), 350);
}

/* ══════════════════════════════════════════════
   KEYBOARD SHORTCUTS
══════════════════════════════════════════════ */

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!modalBackdrop.classList.contains("hidden"))                                         closeModal();
    if (!confirmBackdrop.classList.contains("hidden"))                                       closeConfirm();
    if (!document.getElementById("profile-backdrop").classList.contains("hidden"))           closeProfileModal();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    document.getElementById("global-search")?.focus();
  }
});

/* ══════════════════════════════════════════════
   PROFILE MODAL
══════════════════════════════════════════════ */

async function openProfileModal(empId) {
  try {
    const res = await fetch(`/api/employees/${empId}`);
    if (!res.ok) { showToast("Could not load employee profile.", "error"); return; }
    const emp = await res.json();

    const initials = emp.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
    const color    = AVATAR_BG[empId % AVATAR_BG.length];
    const avatarEl = document.getElementById("profile-avatar");
    const photoEl  = document.getElementById("profile-photo");

    avatarEl.textContent      = initials;
    avatarEl.style.background = color;

    if (emp.photo_url) {
      photoEl.src = emp.photo_url;
      photoEl.classList.remove("hidden");
      avatarEl.classList.add("hidden");
    } else {
      photoEl.classList.add("hidden");
      avatarEl.classList.remove("hidden");
    }

    document.getElementById("profile-name").textContent    = emp.name       || "—";
    document.getElementById("profile-role").textContent    = emp.department || "—";
    document.getElementById("profile-email").textContent   = emp.email      || "—";
    document.getElementById("profile-phone").textContent   = emp.phone      || "Not provided";
    document.getElementById("profile-dept").textContent    = emp.department || "—";
    document.getElementById("profile-address").textContent = emp.address    || "Not provided";
    document.getElementById("profile-salary").textContent  = emp.salary
      ? "₹ " + Number(emp.salary).toLocaleString("en-IN") : "Not provided";

    if (emp.date_of_joining) {
      const d = new Date(emp.date_of_joining);
      document.getElementById("profile-doj").textContent =
        d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    } else {
      document.getElementById("profile-doj").textContent = "Not provided";
    }

    const statusBadge = document.getElementById("profile-status-badge");
    const statusText  = document.getElementById("profile-status-text");
    statusText.textContent = emp.status || "—";
    statusBadge.className  = `status-badge status-${(emp.status || "").toLowerCase().replace(" ", "-")}`;

    // Edit button only exists for admin role
    const editBtn = document.getElementById("profile-edit-btn");
    if (editBtn) {
      editBtn.onclick = () => {
        closeProfileModal();
        openEditModal(empId);
      };
    }

    const backdrop = document.getElementById("profile-backdrop");
    backdrop.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    const box = document.getElementById("profile-box");
    box.style.animation = "none";
    void box.offsetHeight;
    box.style.animation = "";

  } catch (err) {
    showToast("Network error loading profile.", "error");
  }
}

function closeProfileModal() {
  document.getElementById("profile-backdrop").classList.add("hidden");
  document.body.style.overflow = "";
}

document.getElementById("profile-backdrop").addEventListener("click", (e) => {
  if (e.target === document.getElementById("profile-backdrop")) closeProfileModal();
});

/* ══════════════════════════════════════════════
   PHOTO PREVIEW
══════════════════════════════════════════════ */

function previewPhoto(input) {
  const preview = document.getElementById("photo-preview");
  if (!preview || !input.files || !input.files[0]) return;

  const file = input.files[0];
  if (file.size > 5 * 1024 * 1024) {
    showToast("Photo must be under 5MB!", "error");
    input.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    preview.innerHTML = `<img src="${e.target.result}" alt="Preview"/>`;
  };
  reader.readAsDataURL(file);
}