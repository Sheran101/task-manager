import ballerina/http;
import ballerina/log;

type Task record {
    int id;
    string title;
    string description;
    boolean completed;
};

type TaskRequest record {
    string title;
    string description;
};

// In-memory storage for tasks
Task[] tasks = [];
int nextId = 1;

// CORS configuration
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000"],
        allowCredentials: false,
        allowHeaders: ["CORELATION_ID", "Content-Type", "Authorization"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        maxAge: 84900
    }
}

service / on new http:Listener(8080) {
    
    // Get all tasks
    resource function get tasks() returns Task[] {
        log:printInfo("Getting all tasks");
        return tasks;
    }
    
    // Get task by ID
    resource function get tasks/[int id]() returns Task|http:NotFound {
        log:printInfo("Getting task with ID: " + id.toString());
        foreach Task task in tasks {
            if (task.id == id) {
                return task;
            }
        }
        return http:NOT_FOUND;
    }
    
    // Create new task
    resource function post tasks(@http:Payload TaskRequest newTask) returns Task|http:BadRequest {
        log:printInfo("Creating new task: " + newTask.title);
        
        if (newTask.title.trim() == "") {
            return http:BAD_REQUEST;
        }
        
        Task task = {
            id: nextId,
            title: newTask.title,
            description: newTask.description,
            completed: false
        };
        
        tasks.push(task);
        nextId += 1;
        
        log:printInfo("Task created with ID: " + task.id.toString());
        return task;
    }
    
    // Update task
    resource function put tasks/[int id](@http:Payload TaskRequest updatedTask) returns Task|http:NotFound {
        log:printInfo("Updating task with ID: " + id.toString());
        
        foreach int i in 0 ..< tasks.length() {
            if (tasks[i].id == id) {
                tasks[i] = {
                    id: id,
                    title: updatedTask.title,
                    description: updatedTask.description,
                    completed: tasks[i].completed  // Keep existing completion status
                };
                log:printInfo("Task updated successfully");
                return tasks[i];
            }
        }
        return http:NOT_FOUND;
    }
    
    // Toggle task completion status
    resource function patch tasks/[int id]/toggle() returns Task|http:NotFound {
        log:printInfo("Toggling completion status for task with ID: " + id.toString());
        
        foreach int i in 0 ..< tasks.length() {
            if (tasks[i].id == id) {
                tasks[i].completed = !tasks[i].completed;
                log:printInfo("Task completion status toggled successfully");
                return tasks[i];
            }
        }
        return http:NOT_FOUND;
    }
    resource function delete tasks/[int id]() returns http:Ok|http:NotFound {
        log:printInfo("Deleting task with ID: " + id.toString());
        
        foreach int i in 0 ..< tasks.length() {
            if (tasks[i].id == id) {
                _ = tasks.remove(i);
                log:printInfo("Task deleted successfully");
                return http:OK;
            }
        }
        return http:NOT_FOUND;
    }
    
    // Health check endpoint
    resource function get health() returns string {
        return "Task Manager API is running!";
    }
}