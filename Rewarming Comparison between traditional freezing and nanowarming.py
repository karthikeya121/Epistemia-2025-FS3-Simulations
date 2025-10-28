import matplotlib.pyplot as plt
import numpy as np

# Data
time_conv = np.array([0, 2.5, 5, 10, 15, 20])
temp_conv = np.array([-196, -160, -120, -60, -20, 40])

time_nano = np.array([0, 0.5, 1.0, 1.5, 2.0])
temp_nano = np.array([-196, -180, -100, -40, -10])

# Figure setup
fig, ax = plt.subplots(figsize=(8,5), dpi=120)

# Highlight recrystallization zone
ax.axhspan(-120, 0, color='khaki', alpha=0.4, label='Recrystallization Zone')

# Glass transition and freezing point
ax.axhline(-120, color='gray', linestyle='--', linewidth=1)
ax.axhline(0, color='black', linestyle='--', linewidth=1)

# Plot curves
ax.plot(time_conv, temp_conv, '-o', color='blue', linewidth=2, markersize=5,
        label='Conventional Rewarming (Slow)')
ax.plot(time_nano, temp_nano, '-^', color='red', linewidth=2, markersize=5,
        label='Nanowarming (Ultra-Rapid)')

# Text annotations with arrows
ax.annotate('Slow Warming → Recrystallization',
            xy=(10, -60), xytext=(12, -40),
            color='blue', fontsize=9,
            arrowprops=dict(arrowstyle='->', color='blue', lw=1))

ax.annotate('Ultra-Rapid\nWarming → Recrystallization Avoided',
            xy=(0.5, -160), xytext=(1.5, -180),
            color='red', fontsize=9,
            arrowprops=dict(arrowstyle='->', color='red', lw=1))

# Labels and title
ax.set_title('Rewarming Curves: Nanowarming vs. Conventional Method', fontsize=11)
ax.set_xlabel('Time (Conceptual Rewarming Duration)', fontsize=10)
ax.set_ylabel('Temperature (°C + e×t°C)', fontsize=10)

# Axis limits and ticks
ax.set_xlim(0, 20)
ax.set_ylim(-200, 50)
ax.set_xticks(np.arange(0, 21, 2.5))
ax.set_yticks(np.arange(-200, 51, 50))

# Legend
legend = ax.legend(frameon=True, fontsize=8, loc='upper left')
legend.get_frame().set_alpha(0.9)
legend.get_frame().set_linewidth(0.5)

# Clean look
ax.spines['top'].set_visible(True)
ax.spines['right'].set_visible(True)
ax.grid(False)

plt.tight_layout()
plt.show()
