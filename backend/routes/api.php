<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Board;
use App\Models\BoardList;
use App\Models\Card;
use App\Models\CardActivity;
use App\Models\Member;

Route::get('/boards', function () {
    return Board::with(['lists.cards.activities'])->get();
});

Route::post('/boards', function (Request $request) {
    return Board::create($request->validate(['name' => 'required|string']));
});

Route::get('/lists', function () {
    return BoardList::all();
});

Route::post('/lists', function (Request $request) {
    return BoardList::create($request->validate([
        'board_id' => 'required|exists:boards,id',
        'name' => 'required|string',
        'position' => 'nullable|integer'
    ]));
});

Route::get('/cards', function () {
    return Card::with('activities')->get();
});

Route::post('/cards', function (Request $request) {
    $data = $request->validate([
        'board_id' => 'required|exists:boards,id',
        'list_id' => 'required|exists:board_lists,id',
        'title' => 'required|string',
        'description' => 'nullable|string',
        'label' => 'nullable|string',
        'assignee' => 'nullable|string',
        'due_date' => 'nullable|date',
        'position' => 'nullable|integer'
    ]);
    
    $card = Card::create($data);
    CardActivity::create(['card_id' => $card->id, 'action' => 'Created']);
    
    return $card->load('activities');
});

Route::put('/cards/{id}', function (Request $request, $id) {
    $card = Card::findOrFail($id);
    
    $data = $request->validate([
        'title' => 'required|string',
        'description' => 'nullable|string',
        'label' => 'nullable|string',
        'assignee' => 'nullable|string',
        'due_date' => 'nullable|date',
        'list_id' => 'required|exists:board_lists,id'
    ]);
    
    $oldListId = $card->list_id;
    $card->update($data);
    
    if (($request->has('title') && $card->wasChanged('title')) || 
        ($request->has('description') && $card->wasChanged('description')) ||
        ($request->has('due_date') && $card->wasChanged('due_date'))) {
        CardActivity::create(['card_id' => $card->id, 'action' => 'Edited']);
    }
    if ($request->has('label') && $card->wasChanged('label')) {
        CardActivity::create(['card_id' => $card->id, 'action' => 'Label changed']);
    }
    if ($request->has('assignee') && $card->wasChanged('assignee')) {
        CardActivity::create(['card_id' => $card->id, 'action' => 'Assigned']);
    }
    if ($oldListId != $card->list_id) {
        $fromList = BoardList::find($oldListId);
        $toList = BoardList::find($card->list_id);
        CardActivity::create([
            'card_id' => $card->id, 
            'action' => 'Moved',
            'from_column' => $fromList ? $fromList->name : null,
            'to_column' => $toList ? $toList->name : null
        ]);
    }
    
    return $card->load('activities');
});

Route::delete('/cards/{id}', function ($id) {
    Card::findOrFail($id)->delete();
    return response()->json(['message' => 'Deleted']);
});

Route::patch('/cards/{id}/move', function (Request $request, $id) {
    $card = Card::findOrFail($id);
    $data = $request->validate([
        'list_id' => 'required|exists:board_lists,id',
        'position' => 'nullable|integer'
    ]);
    
    $oldListId = $card->list_id;
    $card->update($data);
    
    if ($oldListId != $card->list_id) {
        $fromList = BoardList::find($oldListId);
        $toList = BoardList::find($card->list_id);
        CardActivity::create([
            'card_id' => $card->id, 
            'action' => 'Moved',
            'from_column' => $fromList ? $fromList->name : null,
            'to_column' => $toList ? $toList->name : null
        ]);
    }
    
    return $card->load('activities');
});

Route::get('/cards/{id}/activity', function ($id) {
    return Card::findOrFail($id)->activities;
});

Route::get('/members', function () {
    return Member::all();
});

Route::post('/members', function (Request $request) {
    return Member::create($request->validate(['name' => 'required|string', 'email' => 'nullable|email']));
});
