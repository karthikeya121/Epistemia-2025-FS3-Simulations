import matplotlib.pyplot as plt
import numpy as np

time_slow = np.array([0, 1, 2, 7])
temp_slow = np.array([5, -5, -1, -1])  # freezing plateau just below 0°C


time_vitr = np.array([0, 1, 2, 3])
temp_vitr = np.array([5, -5, -150, -200])

# Plotting
plt.figure(figsize=(8, 4))

# Conventional Slow Freezing (blue solid line with markers)
plt.plot(time_slow, temp_slow, '-o', color='blue', label='Conventional Slow Freezing')

# Vitrification (red dashed line)
plt.plot(time_vitr, temp_vitr, 'r--', label='Vitrification (Ultra-Rapid Cooling)')

# Equilibrium Freezing Point (Tm)
plt.axhline(y=0, color='blue', linestyle=':', label='Equilibrium Freezing Point (Tm)')

# Labels and title
plt.xlabel('Time (Conceptual Units)', fontsize=11)
plt.ylabel('Temperature (°C)', fontsize=11)
plt.ylim(-200, 10)
plt.xlim(0, 7)

# Annotations (positions adjusted to match image)
plt.annotate('Supercooling', xy=(0.8, -5), xytext=(1.5, -25),
             arrowprops=dict(arrowstyle='->', lw=1.2), fontsize=9)

plt.annotate('Freezing Plateau\n(Ice Formation)', xy=(2.5, 0), xytext=(3.5, -15),
             arrowprops=dict(arrowstyle='->', lw=1.2), fontsize=9, ha='center')

plt.annotate('Glass Transition\nTemperature (Tg)', xy=(2, -150), xytext=(1.2, -100),
             arrowprops=dict(arrowstyle='->', lw=1.2), fontsize=9, ha='center')

plt.annotate('Vitreous State\n(Glass)', xy=(2.8, -200), xytext=(3.3, -170),
             arrowprops=dict(arrowstyle='->', lw=1.2), fontsize=9, ha='center')

# Legend
plt.legend(loc='lower right', fontsize=8)

# Grid and layout
plt.grid(True, linestyle=':', linewidth=0.5)
plt.tight_layout()

# Show
plt.show()
