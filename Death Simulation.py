import numpy as np
import matplotlib.pyplot as plt
import random, math

plt.rcParams["figure.figsize"] = (8,4)

def temp_preserve_factor(T, T_reference=25.0, Q10=2.0):
    temp_factor = Q10 ** ((T - T_reference) / 10.0)
    return 1.0 - temp_factor  # low T => strong preservation

def death_rate(T, RH, a=0.2, b=0.8):
    tp = temp_preserve_factor(T)
    return a * (1 - tp) + b * (1 - RH/100.0)

def deterministic_decay(N0, d, t_days):
    t = np.linspace(0, t_days, 300)
    N = N0 * np.exp(-d * t)
    return t, N


Condition1_RH = 'Input condition 1 RH here. **Integer value only**'
Condition2_RH = 'Input condition 2 RH here. **Integer value only**'
a_var = "Temp sensitivity **Integer value only**"
b_var = "Humidity sensitivity **Integer value only**"
t_days = 'Length of simulation **Integer value only**'
N0 = int(1e6)

conds = [
    {"T":2.0, "RH": Condition1_RH, "label":"2°C, 0% RH"},
    {"T":2.0, "RH": Condition2_RH, "label":"2°C, 45% RH"},
]

results = []

for c in conds:
    d = death_rate(c["T"], c["RH"], a=a_var, b=b_var)
    t_det, N_det = deterministic_decay(N0, d, t_days)
    p_survive = math.exp(-d * t_days)
    prob_all_extinct = (1 - p_survive) ** N0
    expected = N0 * p_survive
    results.append((c["label"], d, t_det, N_det, p_survive, expected, prob_all_extinct))

plt.figure()
for label, d, t, N, p, exp, prob0 in results:
    plt.plot(t, N, label=f"{label} (d={d:.3f} day⁻¹)")
plt.yscale('log')
plt.xlabel("Time (days)")
plt.ylabel("Viable cells (log)")
plt.title("Viable count in dried blood (decay model)")
plt.legend()
plt.grid(True, which='both', ls='--', lw=0.5)
plt.show()

for label, d, t, N, p, exp, prob0 in results:
    print(f"Condition: {label}\n  Death rate={d:.3f}/day, Survival p={p:.3e}, "
          f"Expected survivors={exp:.2f}, Extinction prob={prob0:.3e}\n")
