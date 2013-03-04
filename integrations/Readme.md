# Integrations

Integrations are a complex plugin system.
Each module should be considered a full `Integration`.

## Integration.name

***required***

The name of the integration.
This will complain if an integration of the same name already exists.

This will be used when setting up configuration.
Settings will be available unser `Configurable.integrations.$name`.

Please refer to `moduled-configurable` documentation.

## Integration.schema

JSONSchema to validate configurations against before doing anything.
If an integration is not configured it will not be checked.

## Integration.task

An object mapping task name to handler.
This will complain if a task of this name already exists.

Please refer to `modules-task` documentation.

## Integration.action

An object mapping `Understudy` action name to intercept handler.

Please refer to `moduled-action` documentation.