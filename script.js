// Data Storage
let data = {
  mainBalance: 50000,
  debtBalance: 0,
  savingsBalance: 0,
  debts: [],
  savings: [],
  lastMonthDebt: 0,
  lastMonthSavings: 0,
};

// Load data from memory
function loadData() {
  const saved = localStorage.getItem("halipayData");
  if (saved) {
    data = JSON.parse(saved);
  }
  updateUI();
}

// Save data to memory
function saveData() {
  localStorage.setItem("halipayData", JSON.stringify(data));
}

// Update UI
function updateUI() {
  document.getElementById(
    "mainBalance"
  ).textContent = `RWF ${data.mainBalance.toLocaleString()}`;
  document.getElementById(
    "debtBalance"
  ).textContent = `RWF ${data.debtBalance.toLocaleString()}`;
  document.getElementById(
    "savingsBalance"
  ).textContent = `RWF ${data.savingsBalance.toLocaleString()}`;

  // Update change percentages
  const debtChange =
    data.lastMonthDebt > 0
      ? (
          ((data.debtBalance - data.lastMonthDebt) / data.lastMonthDebt) *
          100
        ).toFixed(1)
      : 0;
  const savingsChange =
    data.lastMonthSavings > 0
      ? (
          ((data.savingsBalance - data.lastMonthSavings) /
            data.lastMonthSavings) *
          100
        ).toFixed(1)
      : 0;

  document.getElementById("debtChange").textContent = `${debtChange}%`;
  document.getElementById("savingsChange").textContent = `${
    savingsChange >= 0 ? "+" : ""
  }${savingsChange}%`;

  renderDebts();
  renderSavings();
  renderAdvice();
  saveData();
}

// Render debt cards
function renderDebts() {
  const container = document.getElementById("debtCards");
  container.innerHTML = "";

  data.debts.forEach((debt, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;
    card.dataset.index = index;
    card.dataset.type = "debt";

    card.innerHTML = `
            <div class="card-header">
              <span class="card-name">${debt.name}</span>
              <button onclick="removeDebt(${index})" style="background:none;border:none;color:white;cursor:pointer;font-size:1.2rem;">&times;</button>
            </div>
            <div class="card-amount">RWF ${debt.amount.toLocaleString()}</div>
            <div class="card-details">${debt.interest}% interest • Due: ${
      debt.dueDate
    }</div>
          `;

    card.addEventListener("dragstart", handleCardDragStart);
    container.appendChild(card);
  });

  data.debtBalance = data.debts.reduce((sum, d) => sum + d.amount, 0);
}

// Render savings cards
function renderSavings() {
  const container = document.getElementById("savingsCards");
  container.innerHTML = "";

  data.savings.forEach((saving, index) => {
    const progress = ((saving.amount / saving.goal) * 100).toFixed(1);
    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;
    card.dataset.index = index;
    card.dataset.type = "saving";

    card.innerHTML = `
            <div class="card-header">
              <span class="card-name">${saving.name}</span>
              <button onclick="removeSaving(${index})" style="background:none;border:none;color:white;cursor:pointer;font-size:1.2rem;">&times;</button>
            </div>
            <div class="card-amount">RWF ${saving.amount.toLocaleString()}</div>
            <div class="card-details">Goal: RWF ${saving.goal.toLocaleString()} (${progress}%)</div>
          `;

    card.addEventListener("dragstart", handleCardDragStart);
    container.appendChild(card);
  });

  data.savingsBalance = data.savings.reduce((sum, s) => sum + s.amount, 0);
}

// Financial Advice Generator
function renderAdvice() {
  const container = document.getElementById("adviceContainer");
  container.innerHTML = "";

  const advice = generateAdvice();

  advice.forEach((item) => {
    const card = document.createElement("div");
    card.className = `advice-card ${item.type}`;
    card.innerHTML = `<strong>${item.title}:</strong> ${item.message}`;
    container.appendChild(card);
  });
}

function generateAdvice() {
  const advice = [];
  const totalDebt = data.debtBalance;
  const totalSavings = data.savingsBalance;
  const totalAssets = data.mainBalance + totalSavings;

  if (totalDebt > totalAssets * 0.5) {
    advice.push({
      type: "warning",
      title: "High Debt Alert",
      message:
        "Your debt is more than 50% of your assets. Focus on paying off high-interest debts first using the Avalanche method.",
    });
  }

  if (data.mainBalance < totalDebt * 0.1 && totalDebt > 0) {
    advice.push({
      type: "warning",
      title: "Low Buffer",
      message:
        "Keep at least 10% of your debt amount in your main wallet to handle emergencies.",
    });
  }

  if (totalSavings < data.mainBalance * 0.3 && data.mainBalance > 10000) {
    advice.push({
      type: "info",
      title: "Savings Goal",
      message:
        "Try to save at least 30% of your income. Build your emergency fund first!",
    });
  }

  // Find highest interest debt
  if (data.debts.length > 0) {
    const highestInterest = data.debts.reduce((max, d) =>
      d.interest > max.interest ? d : max
    );
    if (highestInterest.interest > 10) {
      advice.push({
        type: "tip",
        title: "Priority Payment",
        message: `Focus on "${highestInterest.name}" - it has ${highestInterest.interest}% interest. Pay this off first to save money!`,
      });
    }
  }

  // Check for upcoming due dates
  const today = new Date();
  data.debts.forEach((debt) => {
    const dueDate = new Date(debt.dueDate);
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    if (daysUntilDue < 7 && daysUntilDue > 0) {
      advice.push({
        type: "warning",
        title: "Upcoming Payment",
        message: `"${
          debt.name
        }" is due in ${daysUntilDue} days. Make sure you have RWF ${debt.amount.toLocaleString()} ready!`,
      });
    }
  });

  if (advice.length === 0) {
    advice.push({
      type: "success",
      title: "Great Job",
      message:
        "You're managing your finances well! Keep maintaining this balance between savings and expenses.",
    });
  }

  return advice;
}

// Modal Functions
function openAddDebtModal() {
  document.getElementById("addDebtModal").classList.add("active");
}

function openAddSavingModal() {
  document.getElementById("addSavingModal").classList.add("active");
}

function openAddMoneyModal() {
  document.getElementById("addMoneyModal").classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// Add Functions
function addDebt(e) {
  e.preventDefault();
  const debt = {
    name: document.getElementById("debtName").value,
    amount: parseFloat(document.getElementById("debtAmount").value),
    interest: parseFloat(document.getElementById("debtInterest").value),
    dueDate: document.getElementById("debtDue").value,
  };
  data.debts.push(debt);
  updateUI();
  closeModal("addDebtModal");
  e.target.reset();
}

function addSaving(e) {
  e.preventDefault();
  const saving = {
    name: document.getElementById("savingName").value,
    amount: parseFloat(document.getElementById("savingAmount").value),
    goal: parseFloat(document.getElementById("savingGoal").value),
  };
  data.savings.push(saving);
  updateUI();
  closeModal("addSavingModal");
  e.target.reset();
}

function addMoney(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("moneyAmount").value);
  data.mainBalance += amount;
  updateUI();
  closeModal("addMoneyModal");
  e.target.reset();
}

function removeDebt(index) {
  if (confirm("Are you sure you want to remove this debt?")) {
    data.debts.splice(index, 1);
    updateUI();
  }
}

function removeSaving(index) {
  if (confirm("Are you sure you want to remove this saving goal?")) {
    data.savings.splice(index, 1);
    updateUI();
  }
}

// Drag and Drop
let draggedItem = null;
let draggedType = null;

function handleCardDragStart(e) {
  draggedItem = {
    index: parseInt(e.target.dataset.index),
    type: e.target.dataset.type,
  };
  e.dataTransfer.effectAllowed = "move";
}

// Main wallet drag
document.getElementById("moneyWallet").addEventListener("dragstart", (e) => {
  draggedType = "main";
  document.getElementById("debtDropZone").classList.add("active");
  document.getElementById("savingsDropZone").classList.add("active");
});

document.getElementById("moneyWallet").addEventListener("dragend", () => {
  document.getElementById("debtDropZone").classList.remove("active");
  document.getElementById("savingsDropZone").classList.remove("active");
});

// Debt drop zone
const debtDropZone = document.getElementById("debtDropZone");
debtDropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
});

debtDropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  if (draggedType === "main") {
    const amount = prompt(
      "How much money do you want to use to pay debt? (RWF)"
    );
    if (amount && !isNaN(amount)) {
      const payAmount = parseFloat(amount);
      if (payAmount <= data.mainBalance && payAmount > 0) {
        data.mainBalance -= payAmount;

        // Pay off debts (highest interest first - Avalanche method)
        let remaining = payAmount;
        data.debts.sort((a, b) => b.interest - a.interest);

        for (let i = 0; i < data.debts.length && remaining > 0; i++) {
          if (remaining >= data.debts[i].amount) {
            remaining -= data.debts[i].amount;
            data.debts.splice(i, 1);
            i--;
          } else {
            data.debts[i].amount -= remaining;
            remaining = 0;
          }
        }

        updateUI();
        alert(
          `Successfully paid RWF ${payAmount.toLocaleString()} towards your debts!`
        );
      } else {
        alert("Insufficient funds or invalid amount!");
      }
    }
  }
  draggedType = null;
});

// Savings drop zone
const savingsDropZone = document.getElementById("savingsDropZone");
savingsDropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
});

savingsDropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  if (draggedType === "main") {
    const amount = prompt("How much money do you want to save? (RWF)");
    if (amount && !isNaN(amount)) {
      const saveAmount = parseFloat(amount);
      if (saveAmount <= data.mainBalance && saveAmount > 0) {
        data.mainBalance -= saveAmount;

        // Distribute to savings goals
        if (data.savings.length > 0) {
          const goalName = prompt(
            `Which savings goal?\n${data.savings
              .map((s, i) => `${i + 1}. ${s.name}`)
              .join("\n")}\n\nEnter number or leave blank to create new:`
          );

          if (goalName && !isNaN(goalName)) {
            const index = parseInt(goalName) - 1;
            if (index >= 0 && index < data.savings.length) {
              data.savings[index].amount += saveAmount;
            }
          } else {
            // Create new savings goal
            const newGoalName =
              prompt("Name for this saving goal:") || "New Savings";
            const goalAmount =
              prompt("What's your goal amount? (RWF)") || saveAmount * 10;
            data.savings.push({
              name: newGoalName,
              amount: saveAmount,
              goal: parseFloat(goalAmount),
            });
          }
        } else {
          const newGoalName =
            prompt("Name for this saving goal:") || "Emergency Fund";
          const goalAmount =
            prompt("What's your goal amount? (RWF)") || saveAmount * 10;
          data.savings.push({
            name: newGoalName,
            amount: saveAmount,
            goal: parseFloat(goalAmount),
          });
        }

        updateUI();
        alert(`Successfully saved RWF ${saveAmount.toLocaleString()}!`);
      } else {
        alert("Insufficient funds or invalid amount!");
      }
    }
  }
  draggedType = null;
});

// Close modals when clicking outside
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });
});

// Initialize app
loadData();

// Update advice every minute
setInterval(renderAdvice, 60000);
