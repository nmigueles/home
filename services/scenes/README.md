# Scenes Microservice

Expected:

- Set scenes (Trigger them)
- Create scenes
- View scenes
- Delete scenes

The scenes contains actions defined in `config/actions.json`

```JSON
  {
    "name": "action-template",
    "description": "Description of action intended to be displayed.",
    "controller": "controller-name",
    "inputs": {
      "name-of-user-input": {
        "value": "Default value",
        "type": "string"
      }
    }
  }
```
