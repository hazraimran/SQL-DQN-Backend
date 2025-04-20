import csv
import random
import sys  # Add sys module to access command line arguments

# Get number of concepts from command line arguments
if len(sys.argv) > 1:
    num_concepts = int(sys.argv[1])
else:
    # Default to 5 concepts if no argument provided
    num_concepts = 5

print(f"Generating data for {num_concepts} concept masteries...")

# Initialize the first row of data with dynamic size
initial_mastery = [0.6] * num_concepts  # i instances of 0.6
action_reward = [num_concepts - 1, 1.2]  # action and reward placeholders
# i instances with last one bumped to 0.7
next_mastery = [0.6] * (num_concepts - 1) + [0.7]

# Combine all parts for the first row
first_row = initial_mastery + action_reward + next_mastery

# Initialize data with the first row
data = [first_row]

# Generate the remaining rows
for i in range(1, 1000):
    # Copy the nextState values from the previous row to the current state
    prev_row = data[i - 1]
    state = prev_row[num_concepts + 2:]  # Skip the previous action and reward
    new_state = state.copy()

    # Random action between 0 and num_concepts-1
    action = random.randint(0, num_concepts - 1)

    # Calculate reward based on action
    reward = 0
    if 0.4 < state[action] < 0.6:
        reward += 1
    elif 0.8 <= state[action]:
        reward -= 2

    if random.random() < 0.1 or action in [0, 1] and random.random() < 0.9:
        reward -= 0.1
        new_state[action] = round(max(0, min(1, state[action] - 0.05)), 1)
    else:
        reward += 0.2
        new_state[action] = round(max(0, min(1, state[action] + 0.1)), 1)

    # Append the new row
    data.append(state + [action, round(reward, 1)] + new_state)

    # Stop if all masteries reach 0.7 or higher
    if all(mastery >= 0.7 for mastery in new_state):
        break

# Create dynamic header row based on num_concepts
header = []
for i in range(num_concepts):
    header.append(f"mastery[{i}]")
header.append("action")
header.append("reward")
for i in range(num_concepts):
    header.append(f"newMastery[{i}]")

# Append the data to a CSV file
with open("generated_data.csv", "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(header)
    writer.writerows(data)

print(
    f"CSV file generated successfully with {num_concepts} concept masteries!")
