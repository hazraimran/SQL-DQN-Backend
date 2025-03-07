import csv
import random

# Initialize the first row of data
data = [
    [0, 0, 0, 1, -0.3, 0, 1, 0],
    # [0, 0, 0, 1, 0.9, 0, 1, 0.3],
    # [0, 1, 0.3, 3, 0.9, 0, 2, 0.6],
    # [0, 2, 0.6, 9, 0.9, 0, 3, 0.9],
    # [0, 3, 0.9, 2, -0.3, 0, 4, 0.6],
    # [0, 4, 0.6, 5, 0.9, 0, 5, 0.9],
    # [0, 5, 0.9, 7, 0.9, 0, 6, 1],
    # [0, 6, 1, 6, -0.3, 0, 7, 0.9],
    # [0, 7, 0.9, 8, -0.3, 0, 8, 0.8],
    # [0, 8, 0.8, 0, -0.3, 0, 9, 0.7],
    # [0, 9, 0.7, 4, -0.3, 0, 10, 0.6],
    # [0, 10, 0.6, 2, -0.3, 0, 11, 0.5],
    # [0, 11, 0.5, 3, 0.9, 0, 12, 0.8],
    # [0, 12, 0.8, 1, 0.9, 0, 13, 1],
    # [0, 13, 1, 7, 0.9, 0, 14, 1],
    # [0, 14, 1, 5, 0.9, 0, 15, 1],
    # [0, 15, 1, 4, -0.3, 0, 16, 0.9],
    # [0, 16, 0.9, 9, 0.9, 0, 17, 1],
    # [0, 17, 1, 8, -0.3, 0, 18, 0.9],
    # [0, 18, 0.9, 3, 0.9, 0, 19, 1],
    # [0, 19, 1, 0, -0.3, 0, 20, 0.9],
    # [0, 20, 0.9, 6, -0.3, 0, 21, 0.8],
]

# Generate the remaining rows
for i in range(1, 1001):
    # Copy the nextState values from the previous row to the current state
    prev_row = data[i - 1]
    state = [prev_row[5], prev_row[6], prev_row[7]]
    
    # Generate a random action (for demonstration, alternate between even and odd)
    action = random.randint(0, 9)
    
    # Calculate reward based on action
    reward = -0.3 if action % 2 == 1 else 0.9
    
    # Calculate nextState[2] based on reward
    if reward > 0:
        next_state_2 = state[2] + 0.3
    else:
        next_state_2 = state[2] - 0.1
    
    # Ensure nextState[2] stays within [0, 1]
    next_state_2 = round(max(0, min(1, next_state_2)), 1)
    
    # Increment nextState[1] by 1 (as per the pattern)
    next_state = [state[0], state[1] + 1, next_state_2]
    
    # Append the new row
    data.append(state + [action, reward] + next_state)

# Append the data to a CSV file
with open("generated_data.csv", "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["state[0]", "state[1]", "state[2]", "action", "reward", "nextState[0]", "nextState[1]", "nextState[2]"])
    writer.writerows(data)

print("CSV file generated successfully!")
