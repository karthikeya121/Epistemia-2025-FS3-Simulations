import numpy as np
import matplotlib.pyplot as plt
import random, math

# params
arh_var = 'Enter ambient RH value here.'


def q10_temp_factor(T, T_ref=25.0, Q10=2.0):
    return Q10 ** ((T - T_ref) / 10.0)

def local_rh(ambient_rh):
    return min(100.0, ambient_rh + arh_var)  # cloth retains +20% RH

def simulate_cloth_logistic(N0=100.0, r_base=0.8, K=5e5, T=2.0, ambient_RH=0.0, t_max=30.0, dt=0.05):
    rh_local = local_rh(ambient_RH)
    temp_fac = q10_temp_factor(T)
    if rh_local < 20.0:
        moisture_fac = 0.02
    else:
        moisture_fac = rh_local / 100.0
    mult = temp_fac * moisture_fac
    r_env = r_base * mult
    t = np.arange(0, t_max+dt, dt)
    N = np.zeros_like(t)
    N[0] = N0
    for i in range(1, len(t)):
        dN = r_env * N[i-1] * (1 - N[i-1]/K)
        if rh_local < 30.0:
            dN -= 0.01 * N[i-1]
        N[i] = max(0.0, N[i-1] + dN * dt)
    return t, N, rh_local, r_env

#params 2
conds = [
    {"ambient_RH":0.0, "label":"2°C, 0% RH (cloth local RH)"}, # Condition 1
    {"ambient_RH":45.0, "label":"2°C, 45% RH (cloth local RH)"}, # Condition 2
]

results = []
for c in conds:
    t, N, rh_local, r_env = simulate_cloth_logistic(ambient_RH=c["ambient_RH"])
    results.append((c["label"], t, N, rh_local, r_env))

plt.figure()
for label, t, N, rh_local, r_env in results:
    plt.plot(t, N, label=f"{label} (local RH={rh_local:.0f}%, r_env={r_env:.3e})")
plt.yscale('log')
plt.xlabel("Time (days)"); plt.ylabel("Population (log)")
plt.title("Microbial population on cloth with blood stain")
plt.legend(); plt.grid(True, which='both', ls='--', lw=0.5)
plt.show()

for label, t, N, rh_local, r_env in results:
    print(f"Condition: {label}\n  Local RH={rh_local:.1f}%, r_env={r_env:.4e}\n")
