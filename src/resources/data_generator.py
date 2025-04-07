import csv
import random

# Initialize the first row of data
data = [
    [0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 1, 1.2,
     0.6, 0.7, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6],
]

# Generate the remaining rows
for i in range(1, 1000):
    # Copy the nextState values from the previous row to the current state
    prev_row = data[i - 1]
    state = prev_row[12:]
    new_state = state.copy()

    action = random.randint(0, 9)

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
    if all(mastery >= 0.7 for mastery in new_state):
        break

# Append the data to a CSV file
with open("src/resources/generated_data.csv", "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["mastery[0]", "mastery[1]", "mastery[2]", "mastery[3]",
                     "mastery[4]", "mastery[5]", "mastery[6]", "mastery[7]",
                     "mastery[8]", "mastery[9]", "action", "reward",
                     "newMastery[0]", "newMastery[1]", "newMastery[2]",
                     "newMastery[3]", "newMastery[4]", "newMastery[5]",
                     "newMastery[6]", "newMastery[7]", "newMastery[8]",
                     "newMastery[9]"])
    writer.writerows(data)

print("CSV file generated successfully!")
