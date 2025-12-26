import sys
sys.path.insert(0, '/app')
from main import state
print(f"Current Fortress Mode: {state.FORTRESS_MODE}")
state.FORTRESS_MODE = False
print(f"Updated Fortress Mode: {state.FORTRESS_MODE}")
